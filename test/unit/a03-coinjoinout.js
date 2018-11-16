
const utils = require('./utils')

const rp = require('request-promise')
const assert = require('chai').assert

const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

const LOCALHOST = 'http://localhost:5000'

describe('Standard BCH Output', () => {
  before(async () => {
    utils.cleanDb()
  })

  describe('GET /coinjoinout', () => {
    it('should fetch standardized CoinJoin output', async () => {
      const options = {
        method: 'GET',
        uri: `${LOCALHOST}/coinjoinout`,
        resolveWithFullResponse: true,
        json: true,
        headers: {
          Accept: 'application/json'
        }
      }

      const result = await rp(options)
      // console.log(`result.body: ${util.inspect(result.body)}`)

      assert.hasAnyKeys(result.body, ['coinjoinout'])
    })
  })
})
