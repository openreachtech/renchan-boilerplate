'use strict'

const CustomerGraphqlRouteComposer = require('./CustomerGraphqlRouteComposer')

const StubCustomerGraphqlHttpMiddlewareFactory = require('./middleware/StubCustomerGraphqlHttpMiddlewareFactory')

class StubCustomerStubGraphqlRouteComposer extends CustomerGraphqlRouteComposer {
  /** @inheritdoc */
  graphqlHttpMiddlewareFactory () {
    return StubCustomerGraphqlHttpMiddlewareFactory
      .create()
      .createMiddleware()
  }
}

module.exports = StubCustomerStubGraphqlRouteComposer
