/*
  Checks the balance of the wallet.
*/

'use strict'

const shelljs = require('shelljs')
const ccoinjoin = require('./ccoinjoin')

// Wallet functionality
const CreateWallet = require('bch-cli-wallet/src/commands/create-wallet')

const FILENAME = `${__dirname}/../../wallets/wallet.json`
const ACTIVE_WALLET = `${__dirname}/../../wallets/active-wallet.json`
const THRESHOLD = 0.1

const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

module.exports = {
  checkBalance, // Check the balance of the wallet.
  swapWallet, // Rename the current wallet and swap it out with a new one.
  deleteWallet // Delete the wallet and DB entries to clean up.
}

// Query the balance of the wallet and update the wallet file.
async function checkBalance (walletInfo, BITBOX, updateBalance) {
  try {
    const newWalletInfo = await updateBalance.updateBalances(FILENAME, walletInfo, BITBOX)

    // console.log(`newWalletInfo: ${util.inspect(newWalletInfo)}`)
    // return newWalletInfo.balance

    const balance = newWalletInfo.balance

    if (balance >= THRESHOLD) {
      console.log(`Threshold of ${THRESHOLD} BCH reached! Current balance: ${balance}`)

      // Save the current round.
      const round = Number(process.env.ROUND)

      // Swap out existing wallet and increase the ROUND.
      // const newWallet = await swapWallet(BITBOX)
      await swapWallet(BITBOX)

      // Execute the 'TX N+1' part of the Consolidating CoinJoin
      const txid = await ccoinjoin.consolidateUTXOs(walletInfo, BITBOX)
      console.log(`Participant funds consolidated. TXID: ${txid}`)

      // Montior the TX and kick off the TX N+2 part of the Consolidation CoinJoin
      // after 1 confirmation.
      // Note: no await is used because we don't want this function to wait on it.
      monitorTx(txid, round, walletInfo, BITBOX)
    } else {
      console.log(`Current balance of ${balance} has not reached the threshold of ${THRESHOLD} BCH`)
    }

    return balance
  } catch (err) {
    console.log(`Error in check-balance.js/checkBalance()`)
    throw err
  }
}

// Swaps out the existing wallet with a new wallet. Also increments the ROUND.
async function swapWallet (BITBOX) {
  // Swap out the existing wallet.
  shelljs.mv(FILENAME, ACTIVE_WALLET)

  // Update the ROUND.
  process.env.ROUND = Number(process.env.ROUND) + 1

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
  // Delete the wallet.
  shelljs.rm(ACTIVE_WALLET)

  // TODO: Delete the entries in the DB
  console.log(`In the future, I'll delete all DB entries for participants in round ${round}`)
}

// monitor the considation TX and kick off the distribution after it confirms.
async function monitorTx (txid, round, walletInfo, BITBOX) {
  await waitFor1Conf(txid, BITBOX)

  // Get a list of addresses and amounts to send to the participants.
  const outAddrs = await ccoinjoin.getParticipantOutputs(round)

  // Distribute the funds.
  const txid2 = await ccoinjoin.distributeFunds(walletInfo, BITBOX, outAddrs)
  console.log(`Funds distributed to participants. TXID: ${txid2}`)
}

// Wait until the TX shows at least 1 confirmation.
async function waitFor1Conf (txid, BITBOX) {
  const PERIOD = 1000 * 30 // 30 seconds

  let confirms = 0

  while (confirms < 1) {
    console.log(`Checking for confirmation...`)

    confirms = await getTxInfo(txid, BITBOX)

    // Wait and check again.
    await sleep(PERIOD)
  }

  // return true
}

// Get Token info from the TX.
async function getTxInfo (txid, BITBOX) {
  // const retVal = await BITBOX.DataRetrieval.transaction(txid)
  const txInfo = await BITBOX.Transaction.details(txid)
  // console.log(`Info from TXID ${txid}: ${JSON.stringify(retVal, null, 2)}`)
  return txInfo.confirmations
}

// Promise-based sleep function.
function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
