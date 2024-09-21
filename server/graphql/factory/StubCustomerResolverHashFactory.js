'use strict'

const path = require('path')
const {
  graphql: {
    FilterResolverHashCascaderPayload,
    ResolverHashCascader,
  },
} = require('@openreachtech/renchan')

const schemaStatus = new Proxy({
  signUp: true,
  signIn: true,
  locales: true,
  updatePasswordWithResetToken: true,
  verifyEmail: true,
  createPasswordResetToken: true,
}, {
  get: (fallthrough, schema) => !(schema in fallthrough),
})

const CustomerResolverHashFactory = require('./CustomerResolverHashFactory')

/**
 * Resolver hash factory for customer category.
 */
class StubCustomerResolverHashFactory extends CustomerResolverHashFactory {
  /** @inheritdoc */
  get actualResolversDirectoryPath () {
    return path.join(__dirname, '../resolvers/customer/stub')
  }

  /** @inheritdoc */
  createFilterCascader () {
    const payload = FilterResolverHashCascaderPayload.create({
      async executeToFilter ({
        context,
      }) {
        // if (context.customer === null) {
        // throw Error('no auth')
        // }
      },
      schemaStatus,
    })

    return ResolverHashCascader.create({ payload })
  }
}

module.exports = StubCustomerResolverHashFactory
