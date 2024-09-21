'use strict'

const {
  graphql: {
    visa: {
      BaseVisa,
    },
  },
} = require('@openreachtech/renchan')

class CustomerVisa extends BaseVisa {
  /**
   * Constructor.
   *
   * @param {CustomerVisaOptions} options - Options of this constructor.
   * @todo Fulfill * type.
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
   * @returns {*} - Customer entity of Sequelize model.
   * @todo Fulfill * type.
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
 * @typedef {{
 *   extra: *,
 *   certification: *,
 *   schemaPermissionHash?: *,
 *   user?: *,
 * }} CustomerVisaOptions
 * @todo Fulfill * types.
 */
