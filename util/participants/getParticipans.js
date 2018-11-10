const mongoose = require('mongoose')

const config = require('../../config')

// Connect to the Mongo Database.
mongoose.Promise = global.Promise
mongoose.connect(config.database, { useNewUrlParser: true })
mongoose.set('useCreateIndex', true) // Stop deprecation warning.

const Participant = require('../../src/models/participant')

async function getParticipants () {
  const participants = await Participant.find({})
  console.log(`participants: ${JSON.stringify(participants, null, 2)}`)

  mongoose.connection.close()
}
getParticipants()

module.exports = {
  getParticipants
}
