'use strict'

const BaseAppContext = require('./BaseAppContext')
const AdminAuthorizer = require('./visa/certifier/AdminAuthorizer')

class AdminContext extends BaseAppContext {
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
      .header(AdminAuthorizer.ACCESS_TOKEN_HEADER_KEY)
      ?.toString()
      ?? null
  }

  /**
   * getter: Admin entity
   *
   * @returns {{
   *   [key: string]: *
   * }} - Admin entity.
   */
  get admin () {
    return this.visa.getUser()
  }
}

module.exports = AdminContext
