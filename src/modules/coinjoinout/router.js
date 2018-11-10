/*
  Router for standard output API - used by wallets to query the standardize
  output values of BCH, which is at the heart of a successful CoinJoin.
*/

const coinJoinOut = require('./controller')

// export const baseUrl = '/users'
module.exports.baseUrl = '/coinjoinout'

module.exports.routes = [
  {
    method: 'GET',
    route: '/',
    handlers: [
      coinJoinOut.getCoinJoinOut
    ]
  }
]
