/*
  Implements a Consolidating CoinJoin as described here:
  https://gist.github.com/christroutner/457b99b8033fdea5ae565687e6360323
*/

'use strict'

const Participant = require('../models/participant')

// Wallet functionality
const SendAll = require('bch-cli-wallet/src/commands/send-all')
const appUtil = require(`bch-cli-wallet/src/util`)

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
    // Retrieve all participants in the database.
    const participants = await Participant.find({})
    console.log(`participants: ${JSON.stringify(participants, null, 2)}`)
  } catch (err) {
    console.log(`Error in ccoinjoin.js/distributeFunds()`)
    throw err
  }
}
