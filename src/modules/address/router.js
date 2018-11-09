const address = require('./controller')

module.exports.baseUrl = '/address'

module.exports.routes = [
  {
    method: 'POST',
    route: '/',
    handlers: [
      address.createParticipant
    ]
  }
]
