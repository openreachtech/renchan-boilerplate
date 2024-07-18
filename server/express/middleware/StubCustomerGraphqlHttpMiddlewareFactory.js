'use strict'

const CustomerGraphqlHttpMiddlewareFactory = require('./CustomerGraphqlHttpMiddlewareFactory')

const StubCustomerResolverHashFactory = require('../../graphql/factory/StubCustomerResolverHashFactory')

/**
 * Stub Customer graphql http middleware factory.
 */
class StubCustomerGraphqlHttpMiddlewareFactory extends CustomerGraphqlHttpMiddlewareFactory {
  /** @inheritdoc */
  createResolverHash () {
    return StubCustomerResolverHashFactory.create()
      .handleResolverHash()
  }
}

module.exports = StubCustomerGraphqlHttpMiddlewareFactory
