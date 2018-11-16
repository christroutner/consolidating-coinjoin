/*
  This integration test execute the first part (TX N+1) of a Consolidating
  CoinJoin.

  The test expects a HD wallet.json file loaded with several addresses, each
  with a single UTXO containing a small amount of testnet BCH. It then executes
  the TX N+1 step and combines all the UTXOs into a single UTXO in the root address
  of the wallet.
*/

'use strict'

const appUtil = require(`bch-cli-wallet/src/util`)
const ccoinjoin = require(`../../../src/utils/ccoinjoin`)

const BB = require('bitbox-sdk/lib/bitbox-sdk').default

const filename = `${__dirname}/wallet.json`
let walletInfo = appUtil.openWallet(filename)

// Determine if this is a testnet wallet or a mainnet wallet.
let BITBOX
if (walletInfo.network === 'testnet') {
  BITBOX = new BB({ restURL: 'https://trest.bitcoin.com/v1/' })
} else BITBOX = new BB({ restURL: 'https://rest.bitcoin.com/v1/' })

async function runTest () {
  const txid = await ccoinjoin.consolidateUTXOs(walletInfo, BITBOX)
  console.log(`TXID: ${txid}`)
}
runTest()
