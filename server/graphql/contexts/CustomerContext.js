'use strict'

const {
  BaseContext,
} = require('@openreachtech/renchan').graphql

const CustomerAuthorizer = require('./visa/certifier/CustomerAuthorizer')

class CustomerContext extends BaseContext {
  /**
   * Has certified.
   *
   * @returns {boolean} - true: has.
   */
  hasCertified () {
    return this.visa.hasAuthenticated()
      && this.visa.hasAuthorized()
  }

  /**
   * Has permission to access the schema.
   *
   * @param {string} schema - Target schema.
   * @returns {boolean} - true: has.
   */
  hasPermission (schema) {
    return this.visa.hasPermission(schema)
  }

  /**
   * get: Access token.
   *
   * @returns {string?} - Access token.
   */
  get accessToken () {
    return this.request
      .header(CustomerAuthorizer.ACCESS_TOKEN_HEADER_KEY)
      ?.toString()
      ?? null
  }

  /**
   * getter: Customer entity
   *
   * @returns {Record<string, *>} - Customer entity.
   */
  get customer () {
    return this.visa.getUser()
  }
}

module.exports = CustomerContext
