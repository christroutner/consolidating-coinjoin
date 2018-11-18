/*
  Implements a Consolidating CoinJoin as described here:
  https://gist.github.com/christroutner/457b99b8033fdea5ae565687e6360323
*/

'use strict'

const Participant = require('../models/participant')
const wlogger = require(`./logging`)

// Wallet functionality
const SendAll = require('bch-cli-wallet/src/commands/send-all')
const appUtil = require(`bch-cli-wallet/src/util`)

const util = require('util')
util.inspect.defaultOptions = { depth: 3 }

module.exports = {
  consolidateUTXOs, // TX N+1
  getParticipantOutputs, // Generate a list of outputs
  distributeFunds // TX N+2
}

// Consolidate all UTXOs into a single address.
// This is the 'TX N+1' part of a Consolidating CoinJoin.
async function consolidateUTXOs (walletInfo, BITBOX) {
  try {
    wlogger.debug(`entering consolidateUTXOs()`)

    // Get all UTXOs controlled by this wallet.
    const utxos = await appUtil.getUTXOs(walletInfo, BITBOX)
    // console.log(`utxos: ${util.inspect(utxos)}`)

    // Consolidate all UTXOs in the wallet to a single UTXO in the root address.
    const sendAll = new SendAll()
    const txid = await sendAll.sendAllBCH(utxos, walletInfo.rootAddress, walletInfo, BITBOX)

    return txid
  } catch (err) {
    wlogger.error(`Error in ccoinjoin.js/consolidateUTXOS(): ${util.inspect(err)}`)
    console.log(`Error in ccoinjoin.js/consolidateUTXOS()`)
    throw err
  }
}

// Create an array of output addresses and amounts to send, in preparation of
// executing 'TX N+2'
async function getParticipantOutputs (round) {
  try {
    wlogger.debug(`getParticipantOutputs()`)

    wlogger.info(`Getting participants for round ${round}.`)
    const coinjoinoutSat = Number(process.env.COINJOINOUT) * 100000000

    if (!coinjoinoutSat || coinjoinoutSat <= 0) throw new Error(`COINJOINOUT env var not set`)

    // The amount sent to each participant needs to be slightly less than the
    // satoshis recieved, since there will be a transaction fee. The transaction
    // fee is not caclulated until later. To compensate, a usage fee is subtracted
    // here. This could be considered a fee for using the system. For now,
    // I'm setting it to 1000 satoshis. I'll need to add code later to recover
    // this fee.
    const FEE_SAT = 2000

    // Retrieve all participants in the database.
    const participants = await Participant.find({})
    wlogger.info(`${participants.length} participants in round ${round}`)
    // console.log(`participants: ${JSON.stringify(participants, null, 2)}`)

    const outputAddrs = []

    // Loop through each participant in the DB.
    for (var i = 0; i < participants.length; i++) {
      const thisParticipant = participants[i]
      // console.log(`thisParticipant: ${util.inspect(thisParticipant)}`)

      // Only process particpants of the current round.
      if (thisParticipant.round === round) {
        let remainder = thisParticipant.satoshisReceived - FEE_SAT

        // Loop through each output address for this participant.
        for (var j = 0; j < thisParticipant.outputAddrs.length; j++) {
          const thisAddr = thisParticipant.outputAddrs[j]
          // console.log(`thisAddr: ${util.inspect(thisAddr)}`)
          // console.log(`remainder: ${remainder}`)

          // If the next output address doesn't exist, exit the loop.
          if (!thisAddr || thisAddr === '') continue

          // Normal case. Send the standard CoinJoin output and subtract that from the remainder.
          if (remainder > coinjoinoutSat) {
            const sendObj = {
              addr: thisAddr,
              amountSat: coinjoinoutSat
            }

            outputAddrs.push(sendObj)

            remainder -= coinjoinoutSat

          // Corner case: remainder is less than the standard CoinJoin output. In
          // this case, send the remainder to the next output address.
          } else if (remainder > 0 && remainder <= coinjoinoutSat) {
            const sendObj = {
              addr: thisAddr,
              amountSat: remainder
            }

            outputAddrs.push(sendObj)

            remainder = 0
            break

          // Corner case: remainder is 0. Exit the loop.
          } else {
            break
          }
        }
      }
    }

    return outputAddrs
  } catch (err) {
    wlogger.error(`Error in ccoinjoin.js/getParticipantOutputs(): ${util.inspect(err)}`)
    console.log(`Error in ccoinjoin.js/getParticipantOutputs()`)
    throw err
  }
}

// Distribute the consolidated funds to participants output addresses.
// This is 'TX N+2'
async function distributeFunds (walletInfo, BITBOX, outAddrs) {
  try {
    wlogger.debug(`distributeFunds()`)

    const mnemonic = walletInfo.mnemonic

    // root seed buffer
    const rootSeed = BITBOX.Mnemonic.toSeed(mnemonic)

    // master HDNode
    let masterHDNode
    if (walletInfo.network === `testnet`) {
      masterHDNode = BITBOX.HDNode.fromSeed(rootSeed, 'testnet') // Testnet
    } else masterHDNode = BITBOX.HDNode.fromSeed(rootSeed)

    // HDNode of BIP44 account
    const account = BITBOX.HDNode.derivePath(masterHDNode, "m/44'/145'/0'")

    const change = BITBOX.HDNode.derivePath(account, '0/0')

    // get the cash address
    const cashAddress = BITBOX.HDNode.toCashAddress(change)
    // const cashAddress = walletInfo.cashAddress

    // instance of transaction builder
    let transactionBuilder
    if (walletInfo.network === `testnet`) {
      transactionBuilder = new BITBOX.TransactionBuilder('testnet')
    } else transactionBuilder = new BITBOX.TransactionBuilder()

    // Combine all the utxos into the inputs of the TX.
    const u = await BITBOX.Address.utxo([cashAddress])
    const utxo = u[0][0] // Only one utxo.
    // console.log(`utxo: ${util.inspect(utxo)}`)

    transactionBuilder.addInput(utxo.txid, utxo.vout)

    let originalAmount = utxo.satoshis

    wlogger.debug(`Distributing ${originalAmount} BCH to ${outAddrs.length} addresses.`)

    // original amount of satoshis in vin
    // const originalAmount = inputs.length * dust
    wlogger.debug(`originalAmount: ${originalAmount}`)

    // get byte count to calculate fee. paying 1 sat/byte
    const byteCount = BITBOX.BitcoinCash.getByteCount(
      { P2PKH: 1 },
      { P2PKH: outAddrs.length }
    )
    const fee = Math.ceil(byteCount * 1.1)
    wlogger.debug(`fee: ${fee}`)

    // amount to send to receiver. It's the original amount - 1 sat/byte for tx size
    const sendAmount = originalAmount - fee
    wlogger.debug(`sendAmount: ${sendAmount}`)

    let bchOutTotal = 0

    // Loop through the output addresses
    for (var i = 0; i < outAddrs.length; i++) {
      const thisOutAddr = outAddrs[i]

      // For now, the fee gets subtracted from the first output.
      // if (i === 0) {
      //  thisOutAddr.amountSat -= fee
      // }

      bchOutTotal += thisOutAddr.amountSat

      // add output w/ address and amount to send
      transactionBuilder.addOutput(thisOutAddr.addr, thisOutAddr.amountSat)
    }
    wlogger.debug(`Summed output BCH: ${bchOutTotal}`)

    // keypair
    const keyPair = BITBOX.HDNode.toKeyPair(change)

    // sign w/ HDNode
    let redeemScript
    transactionBuilder.sign(
      0,
      keyPair,
      redeemScript,
      transactionBuilder.hashTypes.SIGHASH_ALL,
      utxo.satoshis
    )

    // console.log(`transactionBuilder: ${util.inspect(transactionBuilder)}`)

    // build tx
    const tx = transactionBuilder.build()
    // output rawhex
    const hex = tx.toHex()
    return hex

    // sendRawTransaction to running BCH node
    // const broadcast = await BITBOX.RawTransactions.sendRawTransaction(hex)
    // console.log(`\nTransaction ID: ${broadcast}`)

    // return broadcast
  } catch (err) {
    wlogger.error(`Error in ccoinjoin.js/distributeFunds(): ${util.inspect(err)}`)
    console.log(`Error in ccoinjoin.js/distributeFunds()`)
    throw err
  }
}
