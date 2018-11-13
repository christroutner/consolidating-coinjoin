/*
  Implements a Consolidating CoinJoin as described here:
  https://gist.github.com/christroutner/457b99b8033fdea5ae565687e6360323
*/

'use strict'

const Participant = require('../models/participant')

// Wallet functionality
const SendAll = require('bch-cli-wallet/src/commands/send-all')
const appUtil = require(`bch-cli-wallet/src/util`)

const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

module.exports = {
  consolidateUTXOs, // TX N+1
  distributeFunds // TX N+2
}

// Consolidate all UTXOs into a single address.
// This is the 'TX N+1' part of a Consolidating CoinJoin.
async function consolidateUTXOs (walletInfo, BITBOX) {
  try {
    // Get all UTXOs controlled by this wallet.
    const utxos = await appUtil.getUTXOs(walletInfo, BITBOX)

    // Consolidate all UTXOs in the wallet to a single UTXO in the root address.
    const sendAll = new SendAll()
    const txid = await sendAll.sendAllBCH(utxos, walletInfo.rootAddress, walletInfo, BITBOX)

    return txid
  } catch (err) {
    console.log(`Error in ccoinjoin.js/consolidateUTXOS()`)
    throw err
  }
}

// Distribute the consolidated funds to participants output addresses.
// This is 'TX N+2'
async function distributeFunds (walletInfo, BITBOX, round) {
  try {
    const coinjoinoutSat = process.env.COINJOINOUT * 100000000

    // Retrieve all participants in the database.
    const participants = await Participant.find({})
    // console.log(`participants: ${JSON.stringify(participants, null, 2)}`)

    const outputAddrs = []

    // Loop through each participant in the DB.
    for (var i = 0; i < participants.length; i++) {
      const thisParticipant = participants[i]

      // Only process particpants of the current round.
      if (thisParticipant.round === round) {
        let remainder = thisParticipant.satoshisReceived

        // Loop through each output address for this participant.
        for (var j = 0; j < thisParticipant.outputAddrs.length; j++) {
          const thisAddr = thisParticipant.outputAddrs[j]

          // If the next output address doesn't exist, exit the loop.
          if (!thisAddr || thisAddr === '') break

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
    console.log(`Error in ccoinjoin.js/distributeFunds()`)
    throw err
  }
}
