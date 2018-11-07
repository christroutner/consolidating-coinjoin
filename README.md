# Consolidating CoinJoin
This is an API server forked from this [koa boilerplate](https://github.com/christroutner/babel-free-koa2-api-boilerplate). It implements the Consolidating CoinJoin [described here](https://gist.github.com/christroutner/457b99b8033fdea5ae565687e6360323). It works with this [BCH command-line wallet](https://github.com/christroutner/bch-cli-wallet).

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)

[![Coverage Status](https://coveralls.io/repos/github/christroutner/consolidating-coinjoin/badge.svg?branch=master)](https://coveralls.io/github/christroutner/consolidating-coinjoin?branch=master)

## Requirements
* node __^8.9.4__
* npm __^5.7.1__


## Structure
```
├── bin
│   └── server.js            # Bootstrapping and entry point
├── config                   # Server configuration settings
│   ├── env                  # Environment specific config
│   │   ├── common.js
│   │   ├── development.js
│   │   ├── production.js
│   │   └── test.js
│   ├── index.js             # Config entrypoint - exports config according to envionrment and commons
│   └── passport.js          # Passportjs config of strategies
├── src                      # Source code
│   ├── modules
│   │   ├── controller.js    # Module-specific controllers
│   │   └── router.js        # Router definitions for module
│   ├── models               # Mongoose models
│   └── middleware           # Custom middleware
│       └── validators       # Validation middleware
└── test                     # Unit tests
```

## Usage
* `npm start` Start server on live mode
* `npm run dev` Start server on dev mode with nodemon
* `npm run docs` Generate API documentation
* `npm test` Run mocha tests

## License
MIT
