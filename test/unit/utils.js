const mongoose = require('mongoose')
const rp = require('request-promise')

const LOCALHOST = 'http://localhost:5000'

// Remove all collections from the DB.
function cleanDb () {
  for (const collection in mongoose.connection.collections) {
    if (mongoose.connection.collections.hasOwnProperty(collection)) {
      mongoose.connection.collections[collection].deleteMany()
    }
  }
}

function authUser (agent, callback) {
  agent
    .post('/users')
    .set('Accept', 'application/json')
    .send({ user: { username: 'test', password: 'pass' } })
    .end((err, res) => {
      if (err) { return callback(err) }

      callback(null, {
        user: res.body.user,
        token: res.body.token
      })
    })
}

// This function is used to create new users.
// userObj = {
//   username,
//   password
// }
async function createUser (userObj) {
  try {
    const options = {
      method: 'POST',
      uri: `${LOCALHOST}/users`,
      resolveWithFullResponse: true,
      json: true,
      body: {
        user: {
          username: userObj.username,
          password: userObj.password
        }
      }
    }

    let result = await rp(options)

    const retObj = {
      user: result.body.user,
      token: result.body.token
    }

    return retObj
  } catch (err) {
    console.log('Error in utils.js/createUser(): ' + JSON.stringify(err, null, 2))
    throw err
  }
}

async function mockParticipants () {
  const Participant = require('../../src/models/participant')

  const participant1 = new Participant()
  participant1.round = 0
  participant1.inputAddrs = [
    'bchtest:qq4sx72yfuhqryzm9h23zez27n6n24hdavvfqn2ma3'
  ]
  participant1.outputAddrs = [
    'bchtest:qzrg022p8ykc90c27gy808pmz3lzlwk6lg77y3h8f1',
    'bchtest:qzrg022p8ykc90c27gy808pmz3lzlwk6lg77y3h8f2',
    'bchtest:qzrg022p8ykc90c27gy808pmz3lzlwk6lg77y3h8f3',
    'bchtest:qzrg022p8ykc90c27gy808pmz3lzlwk6lg77y3h8f4',
    'bchtest:qzrg022p8ykc90c27gy808pmz3lzlwk6lg77y3h8f5'
  ]
  participant1.satoshisReported = 5000000
  participant1.satoshisReceived = 5000000
  await participant1.save()

  const participant2 = new Participant()
  participant2.round = 0
  participant2.inputAddrs = [
    'bchtest:qq4sx72yfuhqryzm9h23zez27n6n24hdavvfqn2ma3'
  ]
  participant2.outputAddrs = [
    'bchtest:qzrg022p8ykc90c27gy808pmz3lzlwk6lg77y3h8f6',
    'bchtest:qzrg022p8ykc90c27gy808pmz3lzlwk6lg77y3h8f7',
    'bchtest:qzrg022p8ykc90c27gy808pmz3lzlwk6lg77y3h8f8',
    'bchtest:qzrg022p8ykc90c27gy808pmz3lzlwk6lg77y3h8f9',
    'bchtest:qzrg022p8ykc90c27gy808pmz3lzlwk6lg77y3h810'
  ]
  participant2.satoshisReported = 5000000
  participant2.satoshisReceived = 5000000
  await participant2.save()
}

module.exports = {
  cleanDb,
  authUser,
  createUser,
  mockParticipants
}
