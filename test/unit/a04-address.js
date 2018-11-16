/*

TODO:
 -- Rejects if satoshisReported is not an integer
*/

'use strict'

const utils = require('./utils')
const rp = require('request-promise')
const assert = require('chai').assert

const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

const LOCALHOST = 'http://localhost:5000'

describe('Address', () => {
  before(async () => {
    utils.cleanDb()
  })

  describe('POST /address', () => {
    let prevRound

    it('should reject a non-array output', async () => {
      const outAddrs = 'bchtest:qr05vk3f4d2efnajvz7ns7wlz52atf5vgyhj8ydgug'
      const numInputs = 1
      const amount = 1000

      const options = {
        method: 'POST',
        uri: `${LOCALHOST}/address`,
        resolveWithFullResponse: true,
        json: true,
        body: {
          outAddrs,
          numInputs,
          amount
        }
      }

      try {
        await rp(options)
        // console.log(`result.body: ${util.inspect(result.body)}`)

        assert.equal(true, false, 'Unexpected result!')
      } catch (err) {
        // console.log(`err: `, err)
        assert.equal(err.statusCode, 422, `Expect 422 error`)
        assert.include(err.message, 'outputAddrs must be an array')
      }
    })

    it('should reject a non-number amount', async () => {
      const outAddrs = [
        'bchtest:qr05vk3f4d2efnajvz7ns7wlz52atf5vgyhj8ydgug',
        'bchtest:qpddsjjrrvsh5gu3eqxqrln4sgx58kaly576tc2xn9',
        'bchtest:qpfmklaz53e23f04rnqkgl03x2hhgskkuukjfcea56'
      ]
      const numInputs = 2
      const amount = 'abc'

      const options = {
        method: 'POST',
        uri: `${LOCALHOST}/address`,
        resolveWithFullResponse: true,
        json: true,
        body: {
          outAddrs,
          numInputs,
          amount
        }
      }

      try {
        await rp(options)
        // console.log(`result.body: ${util.inspect(result.body)}`)

        assert.equal(true, false, 'Unexpected result!')
      } catch (err) {
        // console.log(`err: `, err)
        assert.equal(err.statusCode, 422, `Expect 422 error`)
        assert.include(err.message, 'amount needs to be a number')
      }
    })

    it('should reject a non-integer amount', async () => {
      const outAddrs = [
        'bchtest:qr05vk3f4d2efnajvz7ns7wlz52atf5vgyhj8ydgug',
        'bchtest:qpddsjjrrvsh5gu3eqxqrln4sgx58kaly576tc2xn9',
        'bchtest:qpfmklaz53e23f04rnqkgl03x2hhgskkuukjfcea56'
      ]
      const numInputs = 2
      const amount = 0.0123

      const options = {
        method: 'POST',
        uri: `${LOCALHOST}/address`,
        resolveWithFullResponse: true,
        json: true,
        body: {
          outAddrs,
          numInputs,
          amount
        }
      }

      try {
        await rp(options)
        // console.log(`result.body: ${util.inspect(result.body)}`)

        assert.equal(true, false, 'Unexpected result!')
      } catch (err) {
        // console.log(`err: `, err)
        assert.equal(err.statusCode, 422, `Expect 422 error`)
        assert.include(err.message, 'amount needs to be an integer (satoshis)')
      }
    })

    it('should return input addresses', async () => {
      const outAddrs = [
        'bchtest:qr05vk3f4d2efnajvz7ns7wlz52atf5vgyhj8ydgug',
        'bchtest:qpddsjjrrvsh5gu3eqxqrln4sgx58kaly576tc2xn9',
        'bchtest:qpfmklaz53e23f04rnqkgl03x2hhgskkuukjfcea56'
      ]
      const numInputs = 2
      const amount = 1230000

      const options = {
        method: 'POST',
        uri: `${LOCALHOST}/address`,
        resolveWithFullResponse: true,
        json: true,
        body: {
          outAddrs,
          numInputs,
          amount
        }
      }

      const result = await rp(options)
      // console.log(`result.body: ${util.inspect(result.body)}`)

      assert.hasAnyKeys(result.body, [
        'inputAddrs',
        'outputAddrs',
        'txids',
        '_id',
        'round',
        'satoshisReported'
      ])

      assert.isArray(result.body.inputAddrs)
      assert.isArray(result.body.outputAddrs)
      assert.isArray(result.body.txids)
      assert.isNumber(result.body.round)
      assert.isNumber(result.body.satoshisReported)

      assert.equal(result.body.inputAddrs.length, 2)
      assert.equal(result.body.outputAddrs.length, 3)
      assert.equal(result.body.satoshisReported, 1230000)

      prevRound = result.body.round
    })

    it('should change round when process.env.ROUND changes', async () => {
      const outAddrs = [
        'bchtest:qr05vk3f4d2efnajvz7ns7wlz52atf5vgyhj8ydgug',
        'bchtest:qpddsjjrrvsh5gu3eqxqrln4sgx58kaly576tc2xn9',
        'bchtest:qpfmklaz53e23f04rnqkgl03x2hhgskkuukjfcea56'
      ]
      const numInputs = 2
      const amount = 1230000

      // Increment the global ROUND env var.
      process.env.ROUND = prevRound + 1

      const options = {
        method: 'POST',
        uri: `${LOCALHOST}/address`,
        resolveWithFullResponse: true,
        json: true,
        body: {
          outAddrs,
          numInputs,
          amount
        }
      }

      const result = await rp(options)
      // console.log(`result.body: ${util.inspect(result.body)}`)

      assert.equal(result.body.round, prevRound + 1)
    })
  })
})
