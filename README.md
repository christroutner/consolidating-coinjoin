# Consolidating CoinJoin
This is an API server forked from this [koa boilerplate](https://github.com/christroutner/babel-free-koa2-api-boilerplate). It implements the Consolidating CoinJoin [described here](https://gist.github.com/christroutner/457b99b8033fdea5ae565687e6360323). It works with this [BCH command-line wallet](https://github.com/christroutner/bch-cli-wallet).


Version 1.1.1 is a proof-of-concept prototype. This version will be refactored,
tests will be added, and functionality iterated upon.

Future improvements to be made:
- Add bootstrap bot, to bootstrap initial volume and ensure users money are returned within 24 hours.
- Operator fees need to be considered and implemented.
- Auditing of balances needs to be done more thoroughly.
- Ensure DB entries and wallet information is deleted after each round.
  - Implement scrubbing and other extreme deletion measures.
- Add a front end web browser interface with QR codes for easy scanning by smart phone apps.


[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)

[![Coverage Status](https://coveralls.io/repos/github/christroutner/consolidating-coinjoin/badge.svg?branch=master)](https://coveralls.io/github/christroutner/consolidating-coinjoin?branch=master)

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

[![Greenkeeper badge](https://badges.greenkeeper.io/christroutner/consolidating-coinjoin.svg)](https://greenkeeper.io/)

## Requirements
* node __^8.9.4__
* npm __^5.7.1__

## Installation
Installation is different depending on if you want to create a *development* server for developing the code, or a *production* server for setting up your own Consolidating CoinJoin service.

### Development
- `npm install` to install npm dependencies.
- `./install-mongo` to install and setup mongodb.
- `npm test` to run tests and ensure everything is working correctly.
- `npm start` to run a development server.

### Production
This server requires a Mongo database, so it uses Docker Compose to run in production.
[This tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-16-04)
shows how to setup Docker.
[This tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-docker-compose-on-ubuntu-16-04)
shows how to setup Docker Compose. Here are some commands to build and run this
application with Docker Compose:

- `docker-compose build --no-cache` will build the Docker container from scratch.
  If previously used, this will fail without first deleting the `database` folder,
  which is created with root privileges by Docker, so it must be deleted with the
  command `sudo rm -rf database`.

- `docker-compose up -d` will run the server in the background (daemon mode).
  The server attaches to port 5000 on the host by default.

It is assumed that a production server will have nginx sitting in front of the docker containers. Nginx will serve static content, handle SSL, and proxy API calls to the docker container on port 5000.


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
