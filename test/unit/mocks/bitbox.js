/*
  Contains mocks of BITBOX library calls.
*/

'use strict'

const sinon = require('sinon')

// Inspect JS Objects.
const util = require('util')
util.inspect.defaultOptions = {
  showHidden: true,
  colors: true
}

const addressDetails = [
  {
    balance: 0,
    balanceSat: 0,
    totalReceived: 0,
    totalReceivedSat: 0,
    totalSent: 0,
    totalSentSat: 0,
    unconfirmedBalance: 0,
    unconfirmedBalanceSat: 0,
    unconfirmedTxApperances: 0,
    txApperances: 0,
    transactions: [],
    legacyAddress: 'mv9wPCHx2iCdbXBkJ1UTAZCAq57PCL2YQ9',
    cashAddress: 'bchtest:qzsfqeqtdk6plsvglccadkqtf0trf2nyz58090e6tt',
    addressIndex: 0
  },
  {
    balance: 0,
    balanceSat: 0,
    totalReceived: 0.1,
    totalReceivedSat: 10000000,
    totalSent: 0.1,
    totalSentSat: 10000000,
    unconfirmedBalance: 0,
    unconfirmedBalanceSat: 0,
    unconfirmedTxApperances: 0,
    txApperances: 2,
    transactions: [
      '26564508facb32a5f6893cb7bdfd2dcc264b248a1aa7dd0a572117667418ae5b',
      '85ddb8215fc3701a493cf1c450644c5ef32c55aaa2f48ae2d008944394f3e4d3'
    ],
    legacyAddress: 'n3A9BmjrEG3ubJeoAJGwjkymhmqZhGbZR2',
    cashAddress: 'bchtest:qrkkx8au5lxsu2hka2c4ecn3juxjpcuz05wh08hhl2',
    addressIndex: 1
  },
  {
    balance: 0.03,
    balanceSat: 3000000,
    totalReceived: 0.03,
    totalReceivedSat: 3000000,
    totalSent: 0,
    totalSentSat: 0,
    unconfirmedBalance: 0,
    unconfirmedBalanceSat: 0,
    unconfirmedTxApperances: 0,
    txApperances: 1,
    transactions: [
      '26564508facb32a5f6893cb7bdfd2dcc264b248a1aa7dd0a572117667418ae5b'
    ],
    legacyAddress: 'msnHMfK2pwaBWdE7a7y4f7atdzYahRM7t8',
    cashAddress: 'bchtest:qzrg022p8ykc90c27gy808pmz3lzlwk6lg77y3h8fm',
    addressIndex: 2
  },
  {
    balance: 0.06999752,
    balanceSat: 6999752,
    totalReceived: 0.06999752,
    totalReceivedSat: 6999752,
    totalSent: 0,
    totalSentSat: 0,
    unconfirmedBalance: 0,
    unconfirmedBalanceSat: 0,
    unconfirmedTxApperances: 0,
    txApperances: 1,
    transactions: [
      '26564508facb32a5f6893cb7bdfd2dcc264b248a1aa7dd0a572117667418ae5b'
    ],
    legacyAddress: 'mjSPWfCwCgHZC27nS8GQ4AXz9ehhb2GFqz',
    cashAddress: 'bchtest:qq4sx72yfuhqryzm9h23zez27n6n24hdavvfqn2ma3',
    addressIndex: 3
  }
]

const utxos = [
  [
    {
      txid: '26564508facb32a5f6893cb7bdfd2dcc264b248a1aa7dd0a572117667418ae5b',
      vout: 1,
      scriptPubKey: '76a9142b0379444f2e01905b2dd511644af4f53556edeb88ac',
      amount: 0.06999752,
      satoshis: 6999752,
      height: 1265272,
      confirmations: 644,
      legacyAddress: 'mjSPWfCwCgHZC27nS8GQ4AXz9ehhb2GFqz',
      cashAddress: 'bchtest:qq4sx72yfuhqryzm9h23zez27n6n24hdavvfqn2ma3',
      hdIndex: 3
    },
    {
      txid: '26564508facb32a5f6893cb7bdfd2dcc264b248a1aa7dd0a572117667418ae5b',
      vout: 0,
      scriptPubKey: '76a9148687a941392d82bf0af208779c3b147e2fbadafa88ac',
      amount: 0.03,
      satoshis: 3000000,
      height: 1265272,
      confirmations: 733,
      legacyAddress: 'mjSPWfCwCgHZC27nS8GQ4AXz9ehhb2GFqz',
      cashAddress: 'bchtest:qq4sx72yfuhqryzm9h23zez27n6n24hdavvfqn2ma3',
      hdIndex: 2
    }
  ]
]

const mockTransactionDetails = {
  'txid': 'a77d6afcfce99b7b5eb7a503a31d6550ac2ae445d863d5cb32c5065edd73d280',
  'version': 2,
  'locktime': 0,
  'vin': [
    {
      'txid': '986e02d40ef13709b00f66cf2ba0a84b3ec76d63b06625b555abd21788f33a25',
      'vout': 0,
      'sequence': 4294967295,
      'n': 0,
      'scriptSig': {
        'hex': '47304402200c204b9203c3c735f00ec90c4efc47a4da02ae1c1d12b5751fc1a392776f928402206be4edff5c8e5b1ba143ec97bc668cbc71923dd31c97f9b8b83557992bb1475a412103ba8ae11bbdd1e5adfdf79b8a648f58adab015d13247b7dba9158bb37d106e978',
        'asm': '304402200c204b9203c3c735f00ec90c4efc47a4da02ae1c1d12b5751fc1a392776f928402206be4edff5c8e5b1ba143ec97bc668cbc71923dd31c97f9b8b83557992bb1475a[ALL|FORKID] 03ba8ae11bbdd1e5adfdf79b8a648f58adab015d13247b7dba9158bb37d106e978'
      },
      'value': 10653258,
      'legacyAddress': 'mmnuoTQcickc7zvP45zmAm73cXyvjSSLcF',
      'cashAddress': 'bchtest:qpzd24pcgf867x6cr3ulk0w3vqppvp2lactqdj804g'
    }
  ],
  'vout': [
    {
      'value': '0.05600000',
      'n': 0,
      'scriptPubKey': {
        'hex': '76a914d0022bdc9dec08850b3cb9f5f0861df982729f3c88ac',
        'asm': 'OP_DUP OP_HASH160 d0022bdc9dec08850b3cb9f5f0861df982729f3c OP_EQUALVERIFY OP_CHECKSIG',
        'addresses': [
          'mzUoSpce4H6saKwPhw4Lqj3heWn4frEW9x'
        ],
        'type': 'pubkeyhash'
      },
      'spentTxId': null,
      'spentIndex': null,
      'spentHeight': null
    },
    {
      'value': '0.05053010',
      'n': 1,
      'scriptPubKey': {
        'hex': '76a914a0ae440018ce1c2989a949c8776bdef7d1467b0588ac',
        'asm': 'OP_DUP OP_HASH160 a0ae440018ce1c2989a949c8776bdef7d1467b05 OP_EQUALVERIFY OP_CHECKSIG',
        'addresses': [
          'mvAZAwBDGmm9ycxq82NCYApyvH6WoYwJPh'
        ],
        'type': 'pubkeyhash'
      },
      'spentTxId': null,
      'spentIndex': null,
      'spentHeight': null
    }
  ],
  'blockheight': 1268188,
  'confirmations': 1,
  'time': 1542495953,
  'valueOut': 0.1065301,
  'size': 225,
  'valueIn': 0.10653258,
  'fees': 0.00000248
}

class mockTransactionBuilder {
  constructor () {
    this.hashTypes = {
      SIGHASH_ALL: 0x01,
      SIGHASH_NONE: 0x02,
      SIGHASH_SINGLE: 0x03,
      SIGHASH_ANYONECANPAY: 0x80,
      SIGHASH_BITCOINCASH_BIP143: 0x40,
      ADVANCED_TRANSACTION_MARKER: 0x00,
      ADVANCED_TRANSACTION_FLAG: 0x01
    }

    this.transaction = new MockTxBuilder()
  }
  addInput () {
    sinon.stub().returns({})
  }
  addOutput () {
    sinon.stub().returns({})
  }
  sign () {
    sinon.stub().returns({})
  }
  build () {
    return new MockTxBuilder()
  }
}

class MockTxBuilder {
  constructor () {}
  toHex () {
    return 'mockTXHex'
  }
  build () {
    return this.toHex
  }
}

const bitboxMock = {
  Mnemonic: {
    generate: sinon.stub().returns({}),
    wordLists: sinon.stub().returns({}),
    toSeed: sinon.stub().returns({})
  },
  HDNode: {
    fromSeed: sinon.stub().returns({}),
    derivePath: sinon.stub().returns({}),
    toCashAddress: sinon.stub().returns({}),
    toLegacyAddress: sinon.stub().returns({}),
    toKeyPair: sinon.stub().returns({})
  },
  Address: {
    details: sinon.stub().returns(addressDetails),
    utxo: sinon.stub().returns(utxos),
    toLegacyAddress: sinon.stub().returns({})
  },
  TransactionBuilder: mockTransactionBuilder,
  BitcoinCash: {
    getByteCount: sinon.stub().returns(250)
  },
  RawTransactions: {
    sendRawTransaction: sinon.stub().returns(`mockTXID`)
  },
  Transaction: {
    details: sinon.stub().returns(mockTransactionDetails)
  }
}

module.exports = {
  bitboxMock
}
