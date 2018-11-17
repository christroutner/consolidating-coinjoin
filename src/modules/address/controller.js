const Participant = require('../../models/participant')
const GetAddress = require('bch-cli-wallet/src/commands/get-address')
const wlogger = require(`../../utils/logging`)

// Used for error logging.
const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

// Determine the network. Testnet by default.
if (!process.env.NETWORK) process.env.NETWORK = `testnet`
const NETWORK = process.env.NETWORK

// Instantiate BITBOX
const BB = require('bitbox-sdk/lib/bitbox-sdk').default
let BITBOX
if (NETWORK === 'testnet') {
  BITBOX = new BB({ restURL: 'https://trest.bitcoin.com/v1/' })
} else BITBOX = new BB({ restURL: 'https://rest.bitcoin.com/v1/' })

async function createParticipant (ctx) {
  try {
    wlogger.debug(`entering createParticipant()`)

    // Retrieve input data from POST body.
    const outputAddrs = ctx.request.body.outAddrs
    const numInputs = ctx.request.body.numInputs
    const amount = ctx.request.body.amount

    // Input Validation
    if (!Array.isArray(outputAddrs)) return ctx.throw(422, `outputAddrs must be an array`)
    if (isNaN(parseFloat(amount))) return ctx.throw(422, `amount needs to be a number`)
    if (!Number.isInteger(amount)) return ctx.throw(422, `amount needs to be an integer (satoshis)`)

    // Create a new participant model.
    const participant = new Participant()

    // Initialize the model.
    participant.round = Number(process.env.ROUND)
    participant.outputAddrs = outputAddrs
    participant.satoshisReported = amount

    // Generate the input addresses.
    const getAddress = new GetAddress()
    const inputAddrs = []
    const filename = `${__dirname}/../../../wallets/wallet.json`

    for (var i = 0; i < numInputs; i++) {
      const thisAddr = await getAddress.getAddress(filename, BITBOX)
      inputAddrs.push(thisAddr)
      // console.log(`inputAddrs[${i}] = ${thisAddr}`)
    }
    participant.inputAddrs = inputAddrs

    // Save the model.
    await participant.save()

    // Return the input addresses to the participant.
    ctx.body = participant
  } catch (err) {
    wlogger.error(`error in createParticipant(): ${util.inspect(err)}`)
    ctx.throw(422, err.message)
  }
}

module.exports = {
  createParticipant
}
