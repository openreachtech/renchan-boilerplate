// @ts-check
'use strict'

require('../sequelize/activatedModels')

const AppRestfulServer = require('./AppRestfulServer')
const CustomerExpressServer = require('./CustomerExpressServer')

/** @type {AppRestfulServer} */
const apiServer = /** @type {*} */ (AppRestfulServer.create({
  pathPrefix: '/v1',
  message: 'Express GraphQL Server Now Running On http://localhost:8001/'
}))

const server = /** @type {CustomerExpressServer} */ (CustomerExpressServer.create())

apiServer.runAsRestfulApi({
  message: 'Express GraphQL Server Now Running On http://localhost:8001/',
  port: 8001,
})
server.runAsCustomer()
