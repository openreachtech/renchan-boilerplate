// @ts-check
'use strict'

const {
  graphql: {
    visa: {
      BaseVisa
    }
  }
} = require('@openreachtech/renchan')

class CustomerVisa extends BaseVisa {
  /**
   * Constructor.
   *
   * @todo Fulfill * type.
   * @param {CustomerVisaOptions} options - Options of this constructor.
   */
  constructor ({
    extra,
    ...options
  }) {
    super(options)

    this.extra = extra
  }

  /**
   * Get customer entity.
   *
   * @todo Fulfill * type.
   * @returns {*} - Customer entity of Sequelize model.
   */
  getCustomer () {
    return this.getUser()
  }

  /**
   * Has first property in extra options.
   *
   * @returns {boolean} - true: has.
   */
  getExtraFirst () {
    return 'first' in this.extra
  }

  /**
   * Has second property in extra options.
   *
   * @returns {boolean} - true: has.
   */
  getExtraSecond () {
    return 'second' in this.extra
  }
}

module.exports = CustomerVisa

/**
 * @todo Fulfill * types.
 * @typedef {{
 *   extra: *,
 *   certification: *,
 *   schemaPermissionHash?: *,
 *   user?: *,
 * }} CustomerVisaOptions
 */
