'use strict'

const {
  graphql: {
    visa: {
      BaseCertifier,
    },
  },
} = require('@openreachtech/renchan')

const AdminAuthenticator = require('./AdminAuthenticator')
const AdminAuthorizer = require('./AdminAuthorizer')

class AdminCertifier extends BaseCertifier {
  /** @inheritdoc */
  createAuthenticator () {
    return AdminAuthenticator.create({
      request: this.request,
    })
  }

  /** @inheritdoc */
  createAuthorizer () {
    return AdminAuthorizer.create({
      request: this.request,
    })
  }
}

module.exports = AdminCertifier
