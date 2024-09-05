'use strict'

const {
  graphql: {
    visa: {
      BaseVisa,
    },
  },
} = require('@openreachtech/renchan')

class AdminVisa extends BaseVisa {
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
   * @returns {*} - Affiliate entity of Sequelize model.
   * @todo Fulfill * type.
   */
  getAffiliate () {
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

module.exports = AdminVisa

/**
 * @typedef {{
 *   extra: *,
 *   certification: *,
 *   schemaPermissionHash?: *,
 *   user?: *,
 * }} CustomerVisaOptions
 * @todo Fulfill * types.
 */
