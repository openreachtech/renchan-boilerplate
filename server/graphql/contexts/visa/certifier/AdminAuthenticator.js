'use strict'

const {
  graphql: {
    visa: {
      BaseAuthenticator,
    },
  },
} = require('@openreachtech/renchan')

class AdminAuthenticator extends BaseAuthenticator {
  /** @inheritdoc */
  async hasAuthenticated () {
    // NOTE: Never throw.
    return this.certifyByPassword()
  }

  /**
   * Certify by password.
   *
   * @returns {boolean} - true: authenticated.
   */
  certifyByPassword () {
    // TODO: Fulfill.
    return true
  }
}

module.exports = AdminAuthenticator
