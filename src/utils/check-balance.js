/*
  Checks the balance of the wallet.
*/

'use strict'

const shelljs = require('shelljs')

// Wallet functionality
const CreateWallet = require('bch-cli-wallet/src/commands/create-wallet')

const FILENAME = `${__dirname}/../../wallets/wallet.json`
const ACTIVE_WALLET = `${__dirname}/../../wallets/active-wallet.json`
const THRESHOLD = 0.1

const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

module.exports = {
  checkBalance, // Check the balance of the wallet.
  swapWallet,
  deleteWallet
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
function deleteWallet () {
  // Delete the wallet.
  shelljs.rm(ACTIVE_WALLET)

  // TODO: Delete the entries in the DB
}
