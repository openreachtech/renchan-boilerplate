'use strict'

const path = require('path')

const {
  graphql: {
    BaseResolverHashFactory,
    FilterResolverHashCascaderPayload,
    ResolverHashCascader,
  },
} = require('@openreachtech/renchan')

const schemaStatus = new Proxy({
  signIn: true,
}, {
  get: (fallthrough, schema) => !(schema in fallthrough),
})

/**
 * Resolver hash factory for admin category.
 */
class AdminResolverHashFactory extends BaseResolverHashFactory {
  /** @inheritdoc */
  get actualResolversDirectoryPath () {
    return path.join(__dirname, '../resolvers/admin/actual')
  }

  /** @inheritdoc */
  get stubResolversDirectoryPath () {
    return path.join(__dirname, '../resolvers/admin/stub')
  }

  /** @inheritdoc */
  createFilterCascader () {
    const payload = FilterResolverHashCascaderPayload.create({
      async executeToFilter ({
        context,
      }) {
        if (context.admin === null) {
          throw Error('no auth')
        }
      },
      schemaStatus,
    })

    return ResolverHashCascader.create({ payload })
  }
}

module.exports = AdminResolverHashFactory
