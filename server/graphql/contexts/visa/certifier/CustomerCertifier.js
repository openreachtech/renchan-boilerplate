'use strict'

const {
  graphql: {
    visa: {
      BaseCertifier
    }
  }
} = require('@openreachtech/renchan')

const CustomerAuthenticator = require('./CustomerAuthenticator')
const CustomerAuthorizer = require('./CustomerAuthorizer')

class CustomerCertifier extends BaseCertifier {
  /** @inheritdoc */
  createAuthenticator () {
    return CustomerAuthenticator.create({
      request: this.request,
    })
  }

  /** @inheritdoc */
  createAuthorizer () {
    return CustomerAuthorizer.create({
      request: this.request,
    })
  }
}

module.exports = CustomerCertifier
