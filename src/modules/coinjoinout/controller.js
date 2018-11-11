/*
  Router for standard output API - used by wallets to query the standardize
  output values of BCH, which is at the heart of a successful CoinJoin.
*/

async function getCoinJoinOut (ctx) {
  ctx.body = { coinjoinout: process.env.COINJOINOUT }
}

module.exports = {
  getCoinJoinOut
}
