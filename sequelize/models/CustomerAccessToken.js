import {
  RenchanModel,
  ModelAttributeFactory,
} from '@openreachtech/renchan-sequelize'

import SessionCredentialClerk from '../../app/auth/SessionCredentialClerk.js'

const MILLISECONDS_PER_MINUTE = 60 * 1000
const ACCESS_TOKEN_LIFETIME_MINUTES = 15

/**
 * CustomerAccessToken model.
 *
 * The short-lived half of the credential pair. Held in client memory, carried on the
 * `x-renchan-access-token` header, and tied to its refresh series by `sessionKey`.
 */
export default class CustomerAccessToken extends RenchanModel {
  /** @override */
  static createAttributes (DataTypes) {
    const factory = ModelAttributeFactory.create(DataTypes)

    return {
      ...factory.ID_BIGINT,

      // ForeignKey must start with upper case.
      CustomerId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      accessToken: {
        type: DataTypes.STRING(191),
        allowNull: false,
        unique: true,
      },
      sessionKey: {
        type: DataTypes.STRING(191),
        allowNull: false,
      },
      generatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      expiredAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    }
  }

  /** @override */
  static createOptions (sequelizeClient) {
    return {
      ...super.createOptions(sequelizeClient),
    }
  }

  /** @override */
  static associate () {
    super.associate?.()

    this.belongsTo(this._.Customer)
  }

  /** @override */
  static defineScopes (Op) {
    super.defineScopes?.(Op)

    // noop
  }

  /** @override */
  static setupHooks () {
    super.setupHooks?.()

    // noop
  }

  /** @override */
  static defineSubqueries () {
    super.defineSubqueries?.()

    // noop
  }

  /**
   * Build with generated attributes.
   *
   * @param {{
   *   customerId: number
   *   sessionKey: string
   *   generatedAt: Date
   *   expiredAt?: Date
   *   accessToken?: string
   * }} params - Parameters.
   * @returns {CustomerAccessToken}
   */
  static buildWithGeneratedAttributes ({
    customerId,
    sessionKey,
    generatedAt,
    expiredAt = this.createExpiredAt({
      generatedAt,
    }),
    accessToken = this.generateAccessToken(),
  }) {
    return this.build({
      CustomerId: customerId,
      sessionKey,
      generatedAt,
      expiredAt,
      accessToken,
    })
  }

  /**
   * Create expired at.
   *
   * @param {{
   *   generatedAt: Date
   * }} params - Parameters.
   * @returns {Date} - Expired at.
   */
  static createExpiredAt ({
    generatedAt,
  }) {
    const expiredAt = new Date(
      generatedAt.getTime() + (ACCESS_TOKEN_LIFETIME_MINUTES * MILLISECONDS_PER_MINUTE)
    )

    return expiredAt
  }

  /**
   * Generate access token.
   *
   * @returns {string} - Access token.
   */
  static generateAccessToken () {
    const credentialClerk = SessionCredentialClerk.create()

    return credentialClerk.generateToken()
  }

  /**
   * Check if access token is expired.
   *
   * @param {{
   *   pointsAt: Date
   * }} params - Parameters.
   * @returns {boolean} - True if expired.
   */
  isExpired ({
    pointsAt,
  }) {
    const expiredAt = /** @type {Date} */ (
      this.get('expiredAt')
    )

    return expiredAt.getTime() <= pointsAt.getTime()
  }
}

/**
 * @typedef {CustomerAccessToken & {
 *   CustomerId: number
 *   accessToken: string
 *   sessionKey: string
 *   generatedAt: Date
 *   expiredAt: Date
 * }} CustomerAccessTokenEntity
 */

/**
 * @typedef {CustomerAccessTokenEntity & {
 *   Customer: import('./Customer').CustomerEntity
 * }} CustomerAccessTokenAssociatedEntity
 */
