import {
  RenchanModel,
  ModelAttributeFactory,
} from '@openreachtech/renchan-sequelize'

import SessionCredentialClerk from '../../app/auth/SessionCredentialClerk.js'
import {
  env,
} from '../../app/globals/_.js'

const MILLISECONDS_PER_MINUTE = 60 * 1000
const DEFAULT_ACCESS_TOKEN_TTL_MINUTES = 15

/**
 * AdminAccessToken model.
 *
 * The token the management UI authenticates with. It is kept apart from CustomerAccessToken so
 * that a customer's token can never be used for a management operation.
 *
 * The short-lived half of the credential pair, replaced from the refresh token series named by
 * `sessionKey`.
 */
export default class AdminAccessToken extends RenchanModel {
  /** @override */
  static createAttributes (DataTypes) {
    const factory = ModelAttributeFactory.create(DataTypes)

    return {
      ...factory.ID_BIGINT,

      // ForeignKey must start with upper case.
      AdminId: {
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

    this.belongsTo(this._.Admin)
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
   * The session clerk names the principal `customerId` for both audiences; here it is the id of
   * the admin the session belongs to, stored in `AdminId`.
   *
   * @param {{
   *   customerId: number
   *   sessionKey: string
   *   generatedAt: Date
   *   expiredAt?: Date
   *   accessToken?: string
   * }} params - Parameters.
   * @returns {AdminAccessToken} - Built entity, not saved yet.
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
      AdminId: customerId,
      sessionKey,
      generatedAt,
      expiredAt,
      accessToken,
    })
  }

  /**
   * get: Lifetime of an access token, in minutes.
   *
   * @returns {number} - Minutes.
   */
  static get ttlMinutes () {
    return Number(env.AUTH_ACCESS_TOKEN_TTL_MINUTES)
      || DEFAULT_ACCESS_TOKEN_TTL_MINUTES
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
      generatedAt.getTime() + (this.ttlMinutes * MILLISECONDS_PER_MINUTE)
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
 * @typedef {AdminAccessToken & {
 *   AdminId: number
 *   accessToken: string
 *   sessionKey: string
 *   generatedAt: Date
 *   expiredAt: Date
 * }} AdminAccessTokenEntity
 */

/**
 * @typedef {AdminAccessTokenEntity & {
 *   Admin: import('./Admin').AdminEntity
 * }} AdminAccessTokenAssociatedEntity
 */
