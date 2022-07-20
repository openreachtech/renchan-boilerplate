// @ts-check
'use strict'

const path = require('path')

const {
  graphql: {
    BaseResolverHashFactory,
    FilterResolverHashCascaderPayload,
    ResolverHashCascader,
  }
} = require('@openreachtech/renchan')

const schemaStatus = new Proxy({
  signUp: true,
  signIn: true,
}, {
  get: (fallthrough, schema) => !(schema in fallthrough)
})

/**
 * Resolver hash factory for customer category.
 */
class CustomerResolverHashFactory extends BaseResolverHashFactory {
  /** @inheritdoc */
  get actualResolversDirectoryPath () {
    return path.join(__dirname, '../resolvers/customer/actual')
  }

  /** @inheritdoc */
  get stubResolversDirectoryPath () {
    return path.join(__dirname, '../resolvers/customer/stub')
  }

  /** @inheritdoc */
  createFilterCascader () {
    const payload = FilterResolverHashCascaderPayload.create({
      async executeToFilter ({
        context,
      }) {
        if (context.customer === null) {
          throw Error('no auth')
        }
      },
      schemaStatus,
    })

    return ResolverHashCascader.create({ payload })
  }
}

module.exports = CustomerResolverHashFactory
