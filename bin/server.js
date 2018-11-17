const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const convert = require('koa-convert')
const logger = require('koa-logger')
const mongoose = require('mongoose')
const session = require('koa-generic-session')
const passport = require('koa-passport')
const mount = require('koa-mount')
const serve = require('koa-static')
const cors = require('kcors')
const checkBalance = require('../src/utils/check-balance')

// Wallet functionality
const CreateWallet = require('bch-cli-wallet/src/commands/create-wallet')
const UpdateBalance = require('bch-cli-wallet/src/commands/update-balances')

const config = require('../config')
const errorMiddleware = require('../src/middleware')

const CHECK_BALANCE_PERIOD = 1000 * 60 * 2 // 2 minutes

// Determine the network. Testnet by default.
if (!process.env.NETWORK) process.env.NETWORK = `testnet`
const NETWORK = process.env.NETWORK

// Instantiate BITBOX
const BB = require('bitbox-sdk/lib/bitbox-sdk').default
let BITBOX
if (NETWORK === 'testnet') {
  BITBOX = new BB({ restURL: 'https://trest.bitcoin.com/v1/' })
} else BITBOX = new BB({ restURL: 'https://rest.bitcoin.com/v1/' })

// Set the standarized BCH output of the CoinJoin
process.env.COINJOINOUT = 0.01

// Set the CoinJoin round.
if (!process.env.ROUND) process.env.ROUND = 0

async function startServer () {
  // Create a new wallet.
  const createWallet = new CreateWallet()
  const filename = `${__dirname}/../wallets/wallet.json`
  let walletInfo
  if (NETWORK === `testnet`) {
    walletInfo = await createWallet.createWallet(filename, BITBOX, true)
  } else {
    walletInfo = await createWallet.createWallet(filename, BITBOX, false)
  }

  // Create a Koa instance.
  const app = new Koa()
  app.keys = [config.session]

  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  await mongoose.connect(config.database, { useNewUrlParser: true })
  mongoose.set('useCreateIndex', true) // Stop deprecation warning.

  // Wipe the database on startup.
  for (const collection in mongoose.connection.collections) {
    if (mongoose.connection.collections.hasOwnProperty(collection)) {
      mongoose.connection.collections[collection].deleteMany()
    }
  }

  // LOGGING
  const winston = require('winston')
  require('winston-daily-rotate-file')

  // Configure daily-rotation transport.
  const transport = new (winston.transports.DailyRotateFile)({
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: false,
    maxSize: '1m',
    maxFiles: '14d'
  })
  transport.on('rotate', function (oldFilename, newFilename) {
    wlogger.info(`Rotating log files`)
  })

  const wlogger = winston.createLogger({
    level: 'verbose',
    format: winston.format.json(),
    transports: [
      //
      // - Write to all logs with level `info` and below to `combined.log`
      // - Write all logs error (and below) to `error.log`.
      //
      // new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      // new winston.transports.File({ filename: 'logs/combined.log' })
      transport
    ]
  })
  //
  // If we're not in production then log to the `console` with the format:
  // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
  //
  // if (process.env.NODE_ENV !== 'production') {
  wlogger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
  // }

  // MIDDLEWARE START

  app.use(convert(logger()))
  app.use(bodyParser())
  app.use(session())
  app.use(errorMiddleware())

  // Used to generate the docs.
  app.use(convert(mount('/docs', serve(`${process.cwd()}/docs`))))

  // User Authentication
  require('../config/passport')
  app.use(passport.initialize())
  app.use(passport.session())

  // Custom Middleware Modules
  const modules = require('../src/modules')
  modules(app)

  // Enable CORS for testing
  app.use(cors({ origin: '*' }))

  // MIDDLEWARE END

  // app.listen(config.port, () => {
  //  console.log(`Server started on ${config.port}`)
  // })
  await app.listen(config.port)
  console.log(`Server started on ${config.port}`)
  wlogger.info(`Server started on ${config.port}`)

  // Periodically check the balance of server's wallet
  setInterval(function () {
    const updateBalance = new UpdateBalance()
    checkBalance.checkBalance(BITBOX, updateBalance)
  }, CHECK_BALANCE_PERIOD)

  return app
}
// startServer()

// export default app
// module.exports = app
module.exports = {
  startServer
}
