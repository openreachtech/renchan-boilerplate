'use strict'

const {
  graphql: {
    visa: {
      BaseAuthorizer,
    },
  },
} = require('@openreachtech/renchan')

class CustomerAuthorizer extends BaseAuthorizer {
  /** @inheritdoc */
  async hasAuthorized () {
    /*
     * TODO: Fulfill.
     * This check is for each service after signing in.
     */
    return true
  }
}

module.exports = CustomerAuthorizer
