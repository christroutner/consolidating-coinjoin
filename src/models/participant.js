const mongoose = require('mongoose')

const Participant = new mongoose.Schema({
  round: { type: Number }, // The CoinJoin round the participant belongs to.
  inputAddrs: { type: Array }, // Input Addresses assigned to this participant.
  outputAddrs: { type: Array }, // The Output addresses provided by the participant.
  satoshisReported: { type: Number }, // Satoshis participant said they'd send.
  satoshisReceived: { type: Number }, // Satoshis recieved and confirmed.
  txids: { type: Array } // Array of TXIDs of UTXOs reiceved from participant.
})

module.exports = mongoose.model('participant', Participant)
