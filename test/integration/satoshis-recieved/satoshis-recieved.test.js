/*
  This integration test executes the check-balance.js/validateSatoshisRecieved()
  function.

  It expects a wallet.json file with balances on addresses that match the input
  addresses in the inputAddr array of the mocked participant.
*/

'use strict'

process.env.COINJOIN_ENV = 'test'
// process.env.COINJOINOUT = 0.01

const mongoose = require('mongoose')
const config = require('../../../config')
const utils = require('../../unit/utils')

const checkBalance = require(`../../../src/utils/check-balance`)
const Participant = require('../../../src/models/participant')
const appUtil = require(`bch-cli-wallet/src/util`)

const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

const BB = require('bitbox-sdk/lib/bitbox-sdk').default

const filename = `${__dirname}/wallet.json`
let walletInfo = appUtil.openWallet(filename)

// Determine if this is a testnet wallet or a mainnet wallet.
let BITBOX
if (walletInfo.network === 'testnet') {
  BITBOX = new BB({ restURL: 'https://trest.bitcoin.com/v1/' })
} else BITBOX = new BB({ restURL: 'https://rest.bitcoin.com/v1/' })

async function runTest () {
  try {
  // Connect to the Mongo Database.
    mongoose.Promise = global.Promise
    await mongoose.connect(config.database, { useNewUrlParser: true })
    mongoose.set('useCreateIndex', true) // Stop deprecation warning.

    // Wipe the test DB.
    utils.cleanDb()

    // Created artificial participants.
    await mockParticipants()

    // Validate the satoshis recieved from each participant.
    await checkBalance.validateSatoshisRecieved(walletInfo, 0, BITBOX)

    const updatedParticipants = await Participant.find({})
    console.log(`updatedParticipants: ${util.inspect(updatedParticipants)}`)

    mongoose.connection.close()
  } catch (err) {
    console.log(`Error: `, err)
  }
}
runTest()

async function mockParticipants () {
  const participant1 = new Participant()
  participant1.round = 0
  participant1.inputAddrs = [
    'bchtest:qr4t40e2urfvdctvml3z4jagmahn0at2duh8amzdlw',
    'bchtest:qzp45qytegzv0efd6urfrmvgue5dr0meyc49gr3gkw'
  ]
  participant1.outputAddrs = [
    'bchtest:qqda4znuwwtu234uwp9atewsffc4rmys05rfwpveww',
    'bchtest:qrv47es2hyy97yp6fjz90z77u7yr7rckrg66kzkxyl'
  ]
  participant1.satoshisReported = 0.10779582
  await participant1.save()
}

/*
participants: [
  {
    "inputAddrs": [
      "bchtest:qr77t29tpqyvdwydsrcl8jyf73f4yv5mzqjkwq2fr7",
      "bchtest:qr7mch8wkmc59gdjcvuuugean84esl9p3szfp6nktm"
    ],
    "outputAddrs": [
      "bchtest:qrwsznr07c7vwdl7letpet3yu5v0v5jyxs8p4wqjt5",
      "bchtest:qqeqmrmmrfyzvfs0epmwrnsmhxnyzg422572ldyyt4",
      "bchtest:qrpjlyw936wkn635wuv73am90mny6qgr6cl5uq847n",
      "bchtest:qpag7kh9hfsmualcphu62my63pxjg0qapvx0ls7az9",
      "bchtest:qzhhj23q6ym7qrnna3f9xe0llc8lsdmmggw6w2hwu4",
      "bchtest:qqr53dfaqq742zx8l7sgyqxksgwuv6fx8c85u5q0vv",
      "bchtest:qr9xzjg6ur30edd3py0svx9h2k6myj675vgykv8fmu"
    ],
    "txids": [],
    "_id": "5becc312e1fc901debdfd443",
    "round": 0,
    "satoshisReported": 0.06619999,
    "__v": 0
  },
  {
    "inputAddrs": [
      "bchtest:qqawytmxmettzhjpm58hsz9e4wtth64pfyc4jxlclf",
      "bchtest:qp4jdz4msv8vl54htr0dlty75shfzr2lzcs7dlvsez"
    ],
    "outputAddrs": [
      "bchtest:qzuqfcf3t2wsymzwr8x0w0n4erfmu8n5tsppv357dv",
      "bchtest:qzgk5xxdenxrufryj6php8j7ank39eqkrcxpq7nxxa",
      "bchtest:qp9sw058hkp2xy7798ngxgnu2ac276ltrsc5hewack",
      "bchtest:qphxwmu3wq90lwekwmk9pu688h4ey6yvp5390nrum9",
      "bchtest:qq4tkkcnj4exns0ppyf7tg6egv3ekf4sxszphc9psn",
      "bchtest:qre7jy8fs8xj3m23p92nar5c6efns8p3aq4hu4hw7p",
      "bchtest:qzs8tgr0paj8jr5pwf6mjzx72r3j2rv04qurpm3gct"
    ],
    "txids": [],
    "_id": "5becc3eae1fc901debdfd444",
    "round": 0,
    "satoshisReported": 0.0665,
    "__v": 0
  }
]
*/
