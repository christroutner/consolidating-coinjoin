/*
  Router for standard output API - used by wallets to query the standardize
  output values of BCH, which is at the heart of a successful CoinJoin.
*/

async function getStdOut (ctx) {
  ctx.body = { stdout: process.env.STDOUT }
}

module.exports = {
  getStdOut
}
