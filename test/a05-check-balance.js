/*

TODO:

*/

'use strict'

const utils = require('./utils')
// const rp = require('request-promise')
const assert = require('chai').assert
const checkBalance = require('../src/utils/check-balance')
const sinon = require('sinon')

const { bitboxMock } = require('./mocks/bitbox')
const exampleWallet = require('./mocks/testwallet.json')

const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

// const LOCALHOST = 'http://localhost:5000'

describe('Check Balance', () => {
  let mockedWallet
  let BITBOX

  before(async () => {
    utils.cleanDb()
  })

  beforeEach(async () => {
    BITBOX = bitboxMock
    mockedWallet = Object.assign({}, exampleWallet) // Clone the testwallet
  })

  it('should update the balance', async () => {
    const updateBalance = {
      updateBalances: sinon.stub().returns({ balance: 0.01 })
    }

    const balance = await checkBalance.checkBalance(mockedWallet, BITBOX, updateBalance)
    // console.log(`balance: ${balance}`)

    assert.equal(balance, 0.01)
  })
})
