/*
  Checks the balance of the wallet.
*/

'use strict'

const UpdateBalance = require('bch-cli-wallet/src/commands/update-balances')

const FILENAME = `${__dirname}/../../wallets/wallet.json`
const THRESHOLD = 0.1

const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

module.exports = {
  checkBalance // Check the balance of the wallet.
}

async function checkBalance (walletInfo, BITBOX) {
  try {
    const updateBalance = new UpdateBalance()
    const newWalletInfo = await updateBalance.updateBalances(FILENAME, walletInfo, BITBOX)

    // console.log(`newWalletInfo: ${util.inspect(newWalletInfo)}`)
    // return newWalletInfo.balance

    const balance = newWalletInfo.balance

    if (balance >= THRESHOLD) {
      console.log(`Threashold of ${THRESHOLD} BCH reached! Current balance: ${balance}`)
    } else {
      console.log(`Current balance of ${balance} has not reached the threshold of ${THRESHOLD} BCH`)
    }
  } catch (err) {
    console.log(`Error in check-balance.js/checkBalance()`)
    throw err
  }
}
