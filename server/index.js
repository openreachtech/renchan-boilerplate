'use strict'

require('../sequelize/activatedModels')

const AppRestfulServer = require('./AppRestfulServer')
const AdminExpressServer = require('./AdminExpressServer')
const CustomerExpressServer = require('./CustomerExpressServer')
const StubCustomerExpressServer = require('./StubCustomerExpressServer')

/** @type {AppRestfulServer} */
const apiServer = /** @type {*} */ (AppRestfulServer.create({
  pathPrefix: '/v1',
  message: 'Express GraphQL Server Now Running On http://localhost:8001/',
}))

const server = /** @type {CustomerExpressServer} */ (CustomerExpressServer.create())
const stubCustomerServer = /** @type {StubCustomerExpressServer} */ (StubCustomerExpressServer.create())
const adminServer = /** @type {AdminExpressServer} */ (AdminExpressServer.create())

apiServer.runAsRestfulApi({
  message: 'Express GraphQL Server Now Running On http://localhost:8001/',
  port: 8001,
})

server.runAsCustomer()
stubCustomerServer.runAsCustomer()
adminServer.runAsAdmin()
