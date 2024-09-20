'use strict'

const {
  express: {
    BaseExpressServer,
  },
} = require('@openreachtech/renchan')

const AppRootRouteComposer = require('./express/AppRootRouteComposer')
const CustomerGraphqlRouteComposer = require('./express/CustomerGraphqlRouteComposer')

class CustomerExpressServer extends BaseExpressServer {
  /** @inheritdoc */
  composeRoutes () {
    return [
      AppRootRouteComposer.create().createRoute(),
      CustomerGraphqlRouteComposer.create().createRoute({ path: '/graphql-customer' }),
    ]
  }

  /**
   * Run an express server as customer.
   *
   * @param {*} config - Listen config to run server.
   * @returns {CustomerExpressServer} - For method chain.
   */
  runAsCustomer ({
    message = 'Express GraphQL Server Now Running On http://localhost:3900/graphql-customer',
    port = 3900,
  } = {}) {
    this.run({
      port,
      message,
    })

    return this
  }
}

module.exports = CustomerExpressServer
