/*

TODO:

*/

'use strict'

const utils = require('./utils')
// const rp = require('request-promise')
const assert = require('chai').assert
const checkBalance = require('../src/utils/check-balance')
const sinon = require('sinon')
const shelljs = require('shelljs')
const ccoinjoin = require(`../src/utils/ccoinjoin`)

const { bitboxMock } = require('./mocks/bitbox')
const exampleWallet = require('./mocks/testwallet.json')

const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

// const LOCALHOST = 'http://localhost:5000'

describe('Consolidated CoinJoin', () => {
  let mockedWallet
  let BITBOX

  before(async () => {
    utils.cleanDb()
  })

  beforeEach(async () => {
    BITBOX = bitboxMock
    mockedWallet = Object.assign({}, exampleWallet) // Clone the testwallet
  })

  describe('consolidateUTXOs()', () => {
    it('should consolidate UTXOs and return a TX ID', async () => {
      mockedWallet.hasBalance = [
        {
          'index': 2,
          'balance': 0.03,
          'balanceSat': 3000000,
          'unconfirmedBalance': 0,
          'unconfirmedBalanceSat': 0,
          'cashAddress': 'bchtest:qzrg022p8ykc90c27gy808pmz3lzlwk6lg77y3h8fm'
        },
        {
          'index': 3,
          'balance': 0.06999752,
          'balanceSat': 6999752,
          'unconfirmedBalance': 0,
          'unconfirmedBalanceSat': 0,
          'cashAddress': 'bchtest:qq4sx72yfuhqryzm9h23zez27n6n24hdavvfqn2ma3'
        }
      ]

      const result = await ccoinjoin.consolidateUTXOs(mockedWallet, BITBOX)
      // console.log(`result: ${util.inspect(result)}`)

      assert.isString(result)
    })
  })
})
