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
    it('should return input addresses', async () => {
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

      const result = await rp(options)
      console.log(`result.body: ${util.inspect(result.body)}`)

      // assert.hasAnyKeys(result.body, ['stdout'])
    })
  })
})
