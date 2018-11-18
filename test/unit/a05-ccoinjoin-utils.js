/*

TODO:

*/

'use strict'

const testUtils = require('./utils')
// const rp = require('request-promise')
const assert = require('chai').assert
const cCoinJoinUtils = require('../../src/utils/ccoinjoin-utils')
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
    testUtils.cleanDb()
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

      const balance = await cCoinJoinUtils.checkBalance(BITBOX, updateBalance)
      // console.log(`balance: ${balance}`)

      assert.equal(balance, 0.01)
    })
  })

  describe('Wallet Utils', () => {
    it('should swap out the wallet file.', async () => {
      await cCoinJoinUtils.swapWallet(BITBOX)

      const afterFileList = shelljs.ls(`${__dirname}/../../wallets/`)

      // Assert that the file exists in the directory.
      assert.equal(afterFileList.indexOf(`active-wallet.json`) > -1, true)
    })

    it('should delete the active wallet file', async () => {
      await cCoinJoinUtils.deleteWallet(1)

      const afterFileList = shelljs.ls(`${__dirname}/../../wallets/`)

      // Assert that the active wallet has been deleted.
      assert.equal(afterFileList.indexOf(`active-wallet.json`) === -1, true)
    })
  })

  describe('validateSatoshisRecieved', () => {
    it('should validate the satoshis recieved', async () => {
      // Generate a mock DB entries of participants.
      await testUtils.mockParticipants()

      // Mock the address information returned by BITBOX
      let mockAddr = BITBOX.Address.details()
      mockAddr = [mockAddr[0]]
      mockAddr[0].balanceSat = 5000000
      BITBOX.Address.details = sinon.stub().returns(mockAddr)

      // Validate the satoshis recieved by the user.
      await cCoinJoinUtils.validateSatoshisRecieved(mockedWallet, 0, BITBOX)

      const Participant = require('../../src/models/participant')
      const participants = await Participant.find({})
      // console.log(`participants: ${util.inspect(participants)}`)

      assert.equal(participants[0].satoshisReceived, 5000000, 'satoshisRecieved should match')
    })
  })

  describe('waitFor1Conf', () => {
    it('should return when 1 conf is recieved for tx', async () => {
      await cCoinJoinUtils.waitFor1Conf('mockTXID', BITBOX)
      // This test passes if it returns
    })
  })

  describe('monitorTx', () => {
    it('should execute TX N+2 when TX N+1 achieves 1 confirmation', async () => {
      const result = await cCoinJoinUtils.monitorTx('mockTXID', 0, mockedWallet, BITBOX)
      // console.log(`result: ${util.inspect(result)}`)

      assert.equal(result, 'mockTXID', 'Mocked TXID expected to be returned.')
    })
  })

  describe('getTxInfo', () => {
    it('should validate the satoshis recieved', async () => {
      const result = await cCoinJoinUtils.getTxInfo('mockTXID', BITBOX)
      // console.log(`result: ${util.inspect(result)}`)

      assert.equal(result, 1, 'Expecting 1 confirmation mocked data')
    })

    // This test should be run last, as it manipulates the BITBOX mock.
    it('should return zero if there is a (network) error', async () => {
      // Force an error
      BITBOX.Transaction.details = sinon.stub().returns()

      const result = await cCoinJoinUtils.getTxInfo('mockTXID', BITBOX)
      // console.log(`result: ${util.inspect(result)}`)

      assert.equal(result, 0)
    })
  })
})
