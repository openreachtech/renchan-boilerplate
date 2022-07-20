// @ts-check
'use strict'

const {
  graphql: {
    BaseResolver
  }
} = require('@openreachtech/renchan')

class CustomerQueryResolver extends BaseResolver {
  /** @inheritdoc */
  async resolve () {
    return {
      id: 999,
      username: 'hakudajin',
      inviteCode: 'gFQ0pK6T',
      CustomerDetail: {
        email: 'customer@example.com'
      }
    }
  }

  /** @inheritdoc */
  get schema () {
    return 'customer'
  }
}

module.exports = CustomerQueryResolver
