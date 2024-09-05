'use strict'

const path = require('path')

const {
  express: {
    middleware: {
      BaseGraphqlHttpMiddlewareFactory,
    }
  },
  graphql: {
    SchemaLoader,
  }
} = require('@openreachtech/renchan')

const AdminContext = require('../../graphql/contexts/AdminContext')
const AdminResolverHashFactory = require('../../graphql/factory/AdminResolverHashFactory')

/**
 * Customer graphql http middleware factory.
 */
class AdminGraphqlHttpMiddlewareFactory extends BaseGraphqlHttpMiddlewareFactory {
  /** @inheritdoc */
  createSchema () {
    const fullPath = path.join(
      __dirname,
      '../../graphql/schemas/admin.graphql'
    )

    return SchemaLoader.create()
      .loadSchema(fullPath)
  }

  /** @inheritdoc */
  createResolverHash () {
    return AdminResolverHashFactory.create()
      .handleResolverHash()
  }

  /** @inheritdoc */
  getContextClass () {
    return AdminContext
  }
}

module.exports = AdminGraphqlHttpMiddlewareFactory
