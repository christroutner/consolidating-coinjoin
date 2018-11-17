/*
  Checks the balance of the wallet.
*/

'use strict'

const shelljs = require('shelljs')
const ccoinjoin = require('./ccoinjoin')
const Participant = require('../models/participant')
const wlogger = require(`./logging`)

// Wallet functionality
const CreateWallet = require('bch-cli-wallet/src/commands/create-wallet')
const appUtil = require('bch-cli-wallet/src/util')

const FILENAME = `${__dirname}/../../wallets/wallet.json`
const ACTIVE_WALLET = `${__dirname}/../../wallets/active-wallet.json`
const THRESHOLD = 0.1

const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

module.exports = {
  checkBalance, // Check the balance of the wallet.
  swapWallet, // Rename the current wallet and swap it out with a new one.
  deleteWallet, // Delete the wallet and DB entries to clean up.
  validateSatoshisRecieved
}

// Query the balance of the wallet and update the wallet file.
async function checkBalance (BITBOX, updateBalance) {
  try {
    wlogger.debug(`entering checkBalance()`)

    const filename = `${__dirname}/../../wallets/wallet.json`
    let walletInfo = await appUtil.openWallet(filename)

    // TODO: Needs to differentiate between confirmed and unconfirmed balances
    const newWalletInfo = await updateBalance.updateBalances(FILENAME, walletInfo, BITBOX)

    const balance = newWalletInfo.balanceConfirmed

    if (balance >= THRESHOLD) {
      console.log(`newWalletInfo: ${util.inspect(newWalletInfo)}`)

      // Save the current round.
      const round = Number(process.env.ROUND)

      console.log(`Threshold of ${THRESHOLD} BCH reached for round ${round}! Current balance: ${balance}`)

      // Update the participant DB with the recieved amounts.
      await validateSatoshisRecieved(newWalletInfo, round, BITBOX)

      // Swap out existing wallet and increase the ROUND.
      // const newWallet = await swapWallet(BITBOX)
      await swapWallet(BITBOX)

      // Execute the 'TX N+1' part of the Consolidating CoinJoin
      const txid = await ccoinjoin.consolidateUTXOs(newWalletInfo, BITBOX)
      console.log(`Participant funds consolidated. TXID: ${txid}`)

      // Montior the TX and kick off the TX N+2 part of the Consolidation CoinJoin
      // after 1 confirmation.
      // Note: no await is used because we don't want this function to wait on it.
      monitorTx(txid, round, newWalletInfo, BITBOX)
    } else {
      console.log(`Current balance of ${balance} has not reached the threshold of ${THRESHOLD} BCH`)
    }

    return balance
  } catch (err) {
    wlogger.error(`Error in checkBalance(): ${util.inspect(err)}`)
    console.log(`Error in checkBalance()`)
    throw err
  }
}

// TODO Needs unit test.
// Update the participants satoshisReceived
async function validateSatoshisRecieved (newWalletInfo, round, BITBOX) {
  // Dev Assumption: There is only 1 UTXO in the address. This should be valid
  // if the user is using an appropriate wallet (bch-cli-wallet)

  wlogger.debug(`entering validateSatoshisRecieved()`)

  console.log(`newWalletInfo: ${util.inspect(newWalletInfo)}`)

  const participants = await Participant.find({})
  console.log(`participants: ${util.inspect(participants)}`)

  // Loop through all the participants.
  for (var i = 0; i < participants.length; i++) {
    const thisParticipant = participants[i]
    const inAddrs = thisParticipant.inputAddrs

    // Initialize the satoshisReceived property if it's not already.
    thisParticipant.satoshisReceived = 0

    console.log(`this participant: ${util.inspect(thisParticipant)}`)

    // Only process particpants of the current round.
    if (thisParticipant.round === round) {
      // Loop through each input address.
      for (var j = 0; j < inAddrs.length; j++) {
        const thisAddr = inAddrs[j]

        // Query the balance of that address.
        const thisAddrDetails = await BITBOX.Address.details([thisAddr])
        console.log(`thisAddrDetails: ${util.inspect(thisAddrDetails)}`)

        if (thisAddrDetails.length > 1) { console.log(`Warning: check-balance.js/validateSatoshisRecieved detectedd multiple UTXOs in the input address.`) }

        // Add the confirmed balance to satoshisRecieved.
        thisParticipant.satoshisReceived += thisAddrDetails[0].balanceSat
        console.log(`thisParticipant.satoshisReceived: ${thisParticipant.satoshisReceived}`)
      }
    }

    await thisParticipant.save()
  }
}

// Swaps out the existing wallet with a new wallet. Also increments the ROUND.
async function swapWallet (BITBOX) {
  wlogger.debug(`entering swapWallet()`)

  // Swap out the existing wallet.
  shelljs.mv(FILENAME, ACTIVE_WALLET)

  // Update the ROUND.
  process.env.ROUND = Number(process.env.ROUND) + 1
  console.log(`Starting round ${process.env.ROUND}`)

  // Create a new wallet.
  const createWallet = new CreateWallet()
  let walletInfo
  if (process.env.NETWORK === `testnet`) {
    walletInfo = await createWallet.createWallet(FILENAME, BITBOX, true)
  } else {
    walletInfo = await createWallet.createWallet(FILENAME, BITBOX, false)
  }

  return walletInfo
}

// Delete the active wallet.
function deleteWallet (round) {
  wlogger.debug(`entering deleteWallet()`)

  // Delete the wallet.
  shelljs.rm(ACTIVE_WALLET)

  // TODO: Delete the entries in the DB
  console.log(`In the future, I'll delete all DB entries for participants in round ${round}`)
}

// monitor the considation TX and kick off the distribution after it confirms.
async function monitorTx (txid, round, walletInfo, BITBOX) {
  wlogger.debug(`entering monitorTx()`)

  await waitFor1Conf(txid, BITBOX)

  // Get a list of addresses and amounts to send to the participants.
  const outAddrs = await ccoinjoin.getParticipantOutputs(round)

  // Might want to run an updateBalance call here. Since walletInfo.balaance = utxo - fee

  // Distribute the funds.
  const hex = await ccoinjoin.distributeFunds(walletInfo, BITBOX, outAddrs)
  console.log(`Transaction hex: ${hex}`)

  // sendRawTransaction to running BCH node
  const txid2 = await BITBOX.RawTransactions.sendRawTransaction(hex)

  console.log(`Funds distributed to participants. TXID: ${txid2}`)
}

// Wait until the TX shows at least 1 confirmation.
async function waitFor1Conf (txid, BITBOX) {
  wlogger.debug(`entering waitFor1Conf()`)

  const PERIOD = 1000 * 30 // 30 seconds

  let confirms = 0
  const txidMin = txid.slice(-6)

  while (confirms < 1) {
    console.log(`Checking TX ${txidMin} for confirmation...`)

    confirms = await getTxInfo(txid, BITBOX)

    // Wait and check again.
    await sleep(PERIOD)
  }

  // return true
}

// Get Token info from the TX.
async function getTxInfo (txid, BITBOX) {
  try {
    wlogger.debug(`entering getTxInfo()`)

    // const retVal = await BITBOX.DataRetrieval.transaction(txid)
    const txInfo = await BITBOX.Transaction.details(txid)
    // console.log(`Info from TXID ${txid}: ${JSON.stringify(retVal, null, 2)}`)
    return txInfo.confirmations
  } catch (err) {
    wlogger.error(`Error in getTxInfo(): ${util.inspect(err)}`)
    console.log(`Error in getTxInfo()`)

    // Catch network errors and try again.
    return 0
  }
}

// Promise-based sleep function.
function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
