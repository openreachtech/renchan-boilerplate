// @ts-check
'use strict'

const {
  graphql: {
    visa: {
      BaseAuthorizer,
      BaseVisaIssuer,
    },
  },
} = require('@openreachtech/renchan')

const CustomerCertifier = require('./certifier/CustomerCertifier')
const CustomerVisa = require('./CustomerVisa')

// const Customer = require('../../../../sequelize/models/Customer')
// const CustomerAccessToken = require('../../../../sequelize/models/CustomerAccessToken')
// const { Op } = require('sequelize')

class CustomerVisaIssuer extends BaseVisaIssuer {
  /** @inheritdoc */
  get visaClass () {
    return CustomerVisa
  }

  /** @inheritdoc */
  async findCertification () {
    const certifier = CustomerCertifier.create({
      request: this.request,
    })

    return certifier.getCertification()
  }

  /** @inheritdoc */
  async findUser () {
    return this.findCustomer()
  }

  /** @inheritdoc */
  async createSchemaPermissionHash () {
    // TODO: Fulfill.
    return new Proxy({}, {
      get: () => true,
    })
  }

  /**
   * Find customer.
   *
   * @param {{
   *   now?: Date,
   * }} params
   * @returns {Promise<*?>} - Customer entity.
   */
  async findCustomer ({
    now = new Date(),
  } = {}) {
    // TODO: Fulfill.
    return {}

    // const customerId = await this.findCustomerIdByAccessToken({ now })

    // if (!customerId) {
    //   return null
    // }

    // return Customer.scope('+CompanyDetail+CustomerDetail')
    //   .findByPk(customerId)
  }

  /**
   * Find customer id by access token.
   *
   * @param {{
   *   accessToken?: string?,
   *   now?: Date,
   * }} accessToken - Access token.
   * @returns {Promise<number?>} - Customer id.
   */
  async findCustomerIdByAccessToken ({
    accessToken = this.getAccessToken(),
    now = new Date(),
  } = {}) {
    // TODO: Fulfill.
    return null

    // /** @type {{ id: number }?} */
    // const accessTokenEntity = /** @type {*} */ (await CustomerAccessToken.findOne({
    //   where: {
    //     accessToken,
    //     expiredAt: {
    //       [Op.gt]: now,
    //     },
    //   },
    // }))

    // return accessTokenEntity?.customerId ?? null
  }

  /**
   * Get access token from request header.
   *
   * @returns {string?} - Access token.
   */
  getAccessToken () {
    return this.request.header(BaseAuthorizer.ACCESS_TOKEN_HEADER_KEY) ?? null
  }
}

module.exports = CustomerVisaIssuer
