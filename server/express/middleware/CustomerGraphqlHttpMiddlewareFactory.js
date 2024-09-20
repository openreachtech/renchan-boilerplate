// @ts-check
'use strict'

const path = require('path')

const {
  express: {
    middleware: {
      BaseGraphqlHttpMiddlewareFactory,
    },
  },
  graphql: {
    SchemaLoader,
  },
} = require('@openreachtech/renchan')

const CustomerContext = require('../../graphql/contexts/CustomerContext')
const CustomerResolverHashFactory = require('../../graphql/factory/CustomerResolverHashFactory')

/**
 * Customer graphql http middleware factory.
 */
class CustomerGraphqlHttpMiddlewareFactory extends BaseGraphqlHttpMiddlewareFactory {
  /** @inheritdoc */
  createSchema () {
    const fullPath = path.join(
      __dirname,
      '../../graphql/schemas/customer.graphql'
    )

    return SchemaLoader.create()
      .loadSchema(fullPath)
  }

  /** @inheritdoc */
  createResolverHash () {
    return CustomerResolverHashFactory.create()
      .handleResolverHash()
  }

  /** @inheritdoc */
  getContextClass () {
    return CustomerContext
  }
}

module.exports = CustomerGraphqlHttpMiddlewareFactory
