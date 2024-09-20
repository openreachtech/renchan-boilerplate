'use strict'

const {
  express: {
    BaseExpressServer,
  },
} = require('@openreachtech/renchan')

const AppRootRouteComposer = require('./express/AppRootRouteComposer')
const StubCustomerGraphqlRouteComposer = require('./express/StubCustomerGraphqlRouteComposer')

class CustomerExpressServer extends BaseExpressServer {
  /** @inheritdoc */
  composeRoutes () {
    return [
      AppRootRouteComposer.create().createRoute(),
      StubCustomerGraphqlRouteComposer.create().createRoute({ path: '/graphql-customer-stub' }),
    ]
  }

  /**
   * Run an express server as customer.
   *
   * @param {*} config - Listen config to run server.
   * @returns {CustomerExpressServer} - For method chain.
   */
  runAsCustomer ({
    message = 'Express GraphQL Server Now Running On http://localhost:2600/graphql-customer-stub',
    port = 2600,
  } = {}) {
    this.run({
      port,
      message,
    })

    return this
  }
}

module.exports = CustomerExpressServer
