/*
  This integrationt test executes the second part (TX N+2) of a Consolidating
  CoinJoin.

  It expects a HD wallet.json file containing a single UTXO in the root address
  of the wallet. It mocks several participants in the database before calling
  the program functions that will distribute the funds to all the output addresses
  in consistant amounts.
*/

'use strict'

// process.env.COINJOIN_ENV = 'test'
process.env.COINJOINOUT = 0.01

const mongoose = require('mongoose')
const config = require('../../../config')
const utils = require('../../unit/utils')

const ccoinjoin = require(`../../../src/utils/ccoinjoin`)
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
    // utils.cleanDb()

    // Created artificial participants.
    // await mockParticipants()

    // Generate a list of output addresses and
    const outAddrs = await ccoinjoin.getParticipantOutputs(0)
    console.log(`outAddrs: ${util.inspect(outAddrs)}`)

    // Send amounts to the addresses
    const hex = await ccoinjoin.distributeFunds(walletInfo, BITBOX, outAddrs)
    console.log(`hex: ${hex}`)

    // sendRawTransaction to running BCH node
    // const broadcast = await BITBOX.RawTransactions.sendRawTransaction(hex)
    // console.log(`\nTransaction ID: ${broadcast}`)

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
    'bchtest:qq590n0r8kuj6gng2tsrfpcdqxsw457mhgz9qdf9dr'
  ]
  participant1.outputAddrs = [
    'bchtest:qqda4znuwwtu234uwp9atewsffc4rmys05rfwpveww',
    'bchtest:qrv47es2hyy97yp6fjz90z77u7yr7rckrg66kzkxyl'
  ]
  participant1.satoshisReported = 2000000
  participant1.satoshisReceived = 2000000
  await participant1.save()

  const participant2 = new Participant()
  participant2.round = 0
  participant2.inputAddrs = [
    'bchtest:qruswf26c2he6pukp8cqxrm56fppdjytrvxycre274'
  ]
  participant2.outputAddrs = [
    'bchtest:qqpsa2rynnwgg9rhen4nek2qv9r3hcz3tsnwwecsy0',
    'bchtest:qpxzmp7appp7yqj83rxhw5pkf6g4xd2avqztklfhlp',
    'bchtest:qpy8wlnn4gvettwmvwkg96eu008hsgxzkg2q5zdth6',
    'bchtest:qq0nzmexq9cwalassehv5rwa2zxnh9ecxgf4u29vn8',
    'bchtest:qztwtd9l62sq00atpg9ufcnt5c0gk3yhr522q4tr7g'
  ]
  participant2.satoshisReported = 4698719
  participant2.satoshisReceived = 4698719
  await participant2.save()
}
