const Participant = require('../../models/participant')

async function createParticipant (ctx) {
  try {
    // Retrieve input data from POST body.
    const outputAddrs = ctx.request.body.outAddrs
    const amount = ctx.request.body.amount

    // Input Validation
    if (!Array.isArray(outputAddrs)) return ctx.throw(422, `outputAddrs must be an array`)
    if (!isNaN(parseFloat(amount))) return ctx.throw(422, `amount needs to be a number`)

    // Create a new participant model.
    const participant = new Participant()

    // Initialize the model.
    participant.round = Number(process.env.ROUND)
    participant.outputAddrs = outputAddrs
    participant.satoshisReported = amount

    // Generate the input addresses.

    // Save the model.

    // Return the input addresses to the participant.
  } catch (err) {
    ctx.throw(422, err.message)
  }

  const user = new Participant(ctx.request.body.user)
  try {
    await user.save()
  } catch (err) {
    ctx.throw(422, err.message)
  }

  const token = user.generateToken()
  const response = user.toJSON()

  delete response.password

  ctx.body = {
    user: response,
    token
  }
}

module.exports = {
  createParticipant
}
