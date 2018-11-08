const expect = require('chai').expect
const should = require('chai').should
const utils = require('./utils')

const rp = require('request-promise')
const assert = require('chai').assert

const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

const LOCALHOST = 'http://localhost:5000'

should()

describe('Standard BCH Output', () => {
  before(async () => {
    utils.cleanDb()
  })

  describe('GET /stdout', () => {
    it('should fetch standardized BCH output', async () => {
      const options = {
        method: 'GET',
        uri: `${LOCALHOST}/stdout`,
        resolveWithFullResponse: true,
        json: true,
        headers: {
          Accept: 'application/json'
        }
      }

      const result = await rp(options)
      // console.log(`result.body: ${util.inspect(result.body)}`)

      assert.hasAnyKeys(result.body, ['stdout'])
    })
  })
})
