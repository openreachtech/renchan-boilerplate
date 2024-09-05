'use strict'

const {
  Op,
} = require('sequelize')

const {
  graphql: {
    visa: {
      BaseAuthorizer,
      BaseVisaIssuer,
    },
  },
} = require('@openreachtech/renchan')

const AdminCertifier = require('./certifier/AdminCertifier')
const AdminVisa = require('./AdminVisa')

const Admin = require('../../../../sequelize/models/Admin')
const AdminAccessToken = require('../../../../sequelize/models/AdminAccessToken')

class AdminVisaIssuer extends BaseVisaIssuer {
  /** @inheritdoc */
  get visaClass () {
    return AdminVisa
  }

  /** @inheritdoc */
  async findCertification () {
    const certifier = AdminCertifier.create({
      request: this.request,
    })

    return certifier.getCertification()
  }

  /** @inheritdoc */
  async findUser () {
    return this.findAdmin()
  }

  /** @inheritdoc */
  async createSchemaPermissionHash () {
    // TODO: Fulfill.
    return new Proxy({}, {
      get: () => true,
    })
  }

  /**
   * Find admin.
   *
   * @param {{
   *   now?: Date,
   * }} params
   * @returns {Promise<Admin.AdminEntity | null>} - Admin entity.
   */
  async findAdmin ({
    now = new Date(),
  } = {}) {
    const admin = await this.findAdminByAccessToken({ now })

    if (!admin) {
      return null
    }

    return admin
  }

  /**
   * Find admin by access token.
   *
   * @param {{
   *   accessToken?: string | null,
   *   now?: Date,
   * }} accessToken - Access token.
   * @returns {Promise<Admin.AdminEntity | null>}
   */
  async findAdminByAccessToken ({
    accessToken = this.getAccessToken(),
    now = new Date(),
  } = {}) {
    const accessTokenEntity = await /** @type {Promise} */ (
      AdminAccessToken.findOne({
        where: {
          accessToken,
          expiredAt: {
            [Op.gt]: now,
          },
        },
        include: [
          Admin,
        ],
      })
    )

    if (
      !accessTokenEntity
      || !accessTokenEntity.Admin
    ) {
      return null
    }

    return accessTokenEntity.Admin
  }

  /**
   * Get access token from request header.
   *
   * @returns {string | null} - Access token.
   */
  getAccessToken () {
    return this.request.header(BaseAuthorizer.ACCESS_TOKEN_HEADER_KEY) ?? null
  }
}

module.exports = AdminVisaIssuer
