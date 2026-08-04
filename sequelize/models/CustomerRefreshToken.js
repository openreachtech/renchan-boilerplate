import {
  RenchanModel,
  ModelAttributeFactory,
} from '@openreachtech/renchan-sequelize'

import SessionCredentialClerk from '../../app/auth/SessionCredentialClerk.js'
import {
  env,
} from '../../app/globals/_.js'

const MILLISECONDS_PER_DAY = 60 * 60 * 24 * 1000
const DEFAULT_REFRESH_TOKEN_TTL_DAYS = 14

/**
 * CustomerRefreshToken model.
 *
 * The long-lived half of the credential pair. It reaches the browser only as an `HttpOnly`
 * cookie and is never readable from JavaScript, which is the whole reason it may outlive an
 * access token by two weeks.
 *
 * **Only the digest is stored.** `tokenHash` is what a lookup matches on, so a dump of this table
 * is not a set of usable sessions.
 *
 * **`sessionKey` is the series.** Rotation writes a new row carrying the same key and marks the
 * old one `usedAt`. A row that is presented after it was used means two parties hold tokens from
 * one series — the legitimate client and someone who copied it — and the series is revoked
 * whole. This is the only signal available that a refresh token leaked, which is why the column
 * exists at all.
 */
export default class CustomerRefreshToken extends RenchanModel {
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
      tokenHash: {
        type: DataTypes.STRING(191),
        allowNull: false,
        unique: true,
      },
      sessionKey: {
        type: DataTypes.STRING(191),
        allowNull: false,
      },
      usedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      revokedAt: {
        type: DataTypes.DATE,
        allowNull: true,
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
   * The plain token is taken rather than generated here: the caller has to hand that same value
   * to the browser, and only the digest belongs in this table.
   *
   * @param {{
   *   customerId: number
   *   sessionKey: string
   *   refreshToken: string
   *   generatedAt: Date
   *   expiredAt?: Date
   * }} params - Parameters.
   * @returns {CustomerRefreshToken} - Built entity, not saved yet.
   */
  static buildWithGeneratedAttributes ({
    customerId,
    sessionKey,
    refreshToken,
    generatedAt,
    expiredAt = this.createExpiredAt({
      generatedAt,
    }),
  }) {
    return this.build({
      CustomerId: customerId,
      sessionKey,
      tokenHash: this.hashToken({
        token: refreshToken,
      }),
      generatedAt,
      expiredAt,
      usedAt: null,
      revokedAt: null,
    })
  }

  /**
   * Digest a token the way this table stores it.
   *
   * @param {{
   *   token: string
   * }} params - Parameters.
   * @returns {string} - Digest.
   */
  static hashToken ({
    token,
  }) {
    const credentialClerk = SessionCredentialClerk.create()

    return credentialClerk.hashToken({
      token,
    })
  }

  /**
   * get: Lifetime of a refresh token, in days.
   *
   * @returns {number} - Days.
   */
  static get ttlDays () {
    return Number(env.AUTH_REFRESH_TOKEN_TTL_DAYS)
      || DEFAULT_REFRESH_TOKEN_TTL_DAYS
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
      generatedAt.getTime() + (this.ttlDays * MILLISECONDS_PER_DAY)
    )

    return expiredAt
  }

  /**
   * Check if this token is past its expiry.
   *
   * @param {{
   *   pointsAt: Date
   * }} params - Parameters.
   * @returns {boolean} - true: expired.
   */
  isExpired ({
    pointsAt,
  }) {
    const expiredAt = /** @type {Date} */ (
      this.get('expiredAt')
    )

    return expiredAt.getTime() <= pointsAt.getTime()
  }

  /**
   * Check if this token has already been exchanged for a new one.
   *
   * A used token being presented again is the reuse that triggers series revocation.
   *
   * @returns {boolean} - true: already used.
   */
  isUsed () {
    return this.get('usedAt') !== null
  }

  /**
   * Check if this token was revoked.
   *
   * @returns {boolean} - true: revoked.
   */
  isRevoked () {
    return this.get('revokedAt') !== null
  }

  /**
   * Check if this token may still be exchanged.
   *
   * @param {{
   *   pointsAt: Date
   * }} params - Parameters.
   * @returns {boolean} - true: usable.
   */
  isAvailable ({
    pointsAt,
  }) {
    return !this.isUsed()
      && !this.isRevoked()
      && !this.isExpired({
        pointsAt,
      })
  }
}

/**
 * @typedef {CustomerRefreshToken & {
 *   CustomerId: number
 *   tokenHash: string
 *   sessionKey: string
 *   usedAt: Date | null
 *   revokedAt: Date | null
 *   generatedAt: Date
 *   expiredAt: Date
 * }} CustomerRefreshTokenEntity
 */

/**
 * @typedef {CustomerRefreshTokenEntity & {
 *   Customer: import('./Customer').CustomerEntity
 * }} CustomerRefreshTokenAssociatedEntity
 */
