// @ts-check
'use strict'

require('../sequelize/activatedModels')

const CustomerExpressServer = require('./CustomerExpressServer')

const server = /** @type {CustomerExpressServer} */ (CustomerExpressServer.create())

server.runAsCustomer()
