/*

TODO:

*/

'use strict'

const utils = require('./utils')
// const rp = require('request-promise')
const assert = require('chai').assert
const checkBalance = require('../../src/utils/check-balance')
const sinon = require('sinon')
const shelljs = require('shelljs')

const { bitboxMock } = require('./mocks/bitbox')
const exampleWallet = require('./mocks/testwallet.json')

const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

// const LOCALHOST = 'http://localhost:5000'

describe('Check Balance Utilities', () => {
  let mockedWallet
  let BITBOX

  before(async () => {
    utils.cleanDb()
  })

  beforeEach(async () => {
    BITBOX = bitboxMock
    mockedWallet = Object.assign({}, exampleWallet) // Clone the testwallet
  })

  describe('Check Balance', () => {
    it('should update the balance', async () => {
      const updateBalance = {
        updateBalances: sinon.stub().returns({ balanceConfirmed: 0.01 })
      }

      const balance = await checkBalance.checkBalance(BITBOX, updateBalance)
      // console.log(`balance: ${balance}`)

      assert.equal(balance, 0.01)
    })
  })

  describe('Wallet Utils', () => {
    it('should swap out the wallet file.', async () => {
      await checkBalance.swapWallet(BITBOX)

      const afterFileList = shelljs.ls(`${__dirname}/../../wallets/`)

      // Assert that the file exists in the directory.
      assert.equal(afterFileList.indexOf(`active-wallet.json`) > -1, true)
    })

    it('should delete the active wallet file', async () => {
      await checkBalance.deleteWallet(1)

      const afterFileList = shelljs.ls(`${__dirname}/../../wallets/`)

      // Assert that the active wallet has been deleted.
      assert.equal(afterFileList.indexOf(`active-wallet.json`) === -1, true)
    })
  })
})
