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
const CreateWallet = require('bch-cli-wallet/src/commands/create-wallet')

const config = require('../config')
const errorMiddleware = require('../src/middleware')

// Determine the network. Testnet by default.
if (!process.env.NETWORK) process.env.NETWORK = `testnet`
const NETWORK = process.env.NETWORK

const BB = require('bitbox-sdk/lib/bitbox-sdk').default
let BITBOX
if (NETWORK === 'testnet') {
  BITBOX = new BB({ restURL: 'https://trest.bitcoin.com/v1/' })
} else BITBOX = new BB({ restURL: 'https://rest.bitcoin.com/v1/' })

// Set the standarized BCH output of the CoinJoin
process.env.STDOUT = 0.01

// Set the CoinJoin round.
if (!process.env.ROUND) process.env.ROUND = 0

async function startServer () {
  // Create a new wallet.
  const createWallet = new CreateWallet()
  if (NETWORK === `testnet`) {
    await createWallet.createWallet('wallet', BITBOX, true)
  } else {
    await createWallet.createWallet('wallet', BITBOX, false)
  }

  // Create a Koa instance.
  const app = new Koa()
  app.keys = [config.session]

  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  await mongoose.connect(config.database, { useNewUrlParser: true })
  mongoose.set('useCreateIndex', true) // Stop deprecation warning.

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

  return app
}
// startServer()

// export default app
// module.exports = app
module.exports = {
  startServer
}
