/*
  This integrationt test executes the second part (TX N+2) of a Consolidating
  CoinJoin.

  It expects a HD wallet.json file containing a single UTXO in the root address
  of the wallet. It mocks several participants in the database before calling
  the program functions that will distribute the funds to all the output addresses
  in consistant amounts.
*/

'use strict'
