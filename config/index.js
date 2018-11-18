const common = require('./env/common')

const env = process.env.COINJOIN_ENV || 'development'
console.log(`Starting ${env} environment`)
const config = require(`./env/${env}`)

module.exports = Object.assign({}, common, config)
