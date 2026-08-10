import SessionCredentialClerk from './SessionCredentialClerk.js'
import SessionSavingResult from './SessionSavingResult.js'
import SessionRevocationResult from './SessionRevocationResult.js'

/**
 * The single window for a session's data — every find / save / update / delete across the tables a
 * session is made of (access tokens + refresh tokens). Callers depend only on this class and never
 * touch the tables themselves.
 *
 * The tables are injected, not imported, so both audiences share one implementation. Each public
 * write opens its own transaction and reports the outcome as `{ error, … }`: the saving logic is
 * throwable, so a throw rolls the transaction back and is handed back as `error` (null on success)
 * — callers read `error` and never have the exception thrown at them. Error-naming is left to the
 * resolver.
 */
export default class SessionClerk {
  /**
   * Constructor.
   *
   * @param {SessionClerkParams} params - Parameters.
   */
  constructor ({
    AccessTokenModel,
    RefreshTokenModel,
    credentialClerk,
  }) {
    this.AccessTokenModel = AccessTokenModel
    this.RefreshTokenModel = RefreshTokenModel
    this.credentialClerk = credentialClerk
  }

  /**
   * Factory method.
   *
   * @template {X extends typeof SessionClerk ? X : never} T, X
   * @param {SessionClerkFactoryParams} params - Parameters.
   * @returns {InstanceType<T>} - Instance of this class.
   * @this {T}
   */
  static create ({
    AccessTokenModel,
    RefreshTokenModel,
    credentialClerk = this.createCredentialClerk(),
  }) {
    return /** @type {InstanceType<T>} */ (
      new this({
        AccessTokenModel,
        RefreshTokenModel,
        credentialClerk,
      })
    )
  }

  /**
   * get: SessionCredentialClerk class — a seam so tests can substitute it.
   *
   * @returns {typeof SessionCredentialClerk} - The class.
   */
  static get SessionCredentialClerkCtor () {
    return SessionCredentialClerk
  }

  /**
   * Create session credential clerk.
   *
   * @returns {SessionCredentialClerk} - Session credential clerk.
   */
  static createCredentialClerk () {
    return this.SessionCredentialClerkCtor.create()
  }

  /**
   * Start a session's token pair, in a series of its own. Reports the outcome; on a throw the
   * transaction is rolled back and returned as the `error`.
   *
   * @param {{
   *   customerId: number
   *   now: Date
   *   sessionKey?: string
   * }} params - Parameters.
   * @returns {Promise<SessionSavingResult>} - The error (null on success) and the saved pair.
   * @public
   */
  async saveSession ({
    customerId,
    now,
    sessionKey = this.credentialClerk.generateSessionKey(),
  }) {
    try {
      const credentialPair = await this.AccessTokenModel
        .beginTransaction(async transaction =>
          this.saveTokenPair({
            customerId,
            sessionKey,
            now,
            transaction,
          })
        )

      return SessionSavingResult.create({
        error: null,
        credentialPair,
      })
    } catch (error) {
      return SessionSavingResult.create({
        error,
        credentialPair: null,
      })
    }
  }

  /**
   * Save both halves of a pair within a series. Throwable; runs inside a caller-opened transaction.
   *
   * @param {{
   *   customerId: number
   *   sessionKey: string
   *   now: Date
   *   transaction: Transaction
   * }} params - Parameters.
   * @returns {Promise<SessionCredentialPair>} - The saved pair, plus the plain refresh token.
   */
  async saveTokenPair ({
    customerId,
    sessionKey,
    now,
    transaction,
  }) {
    const refreshToken = this.credentialClerk.generateToken()

    const accessTokenEntity = await this.saveAccessToken({
      customerId,
      sessionKey,
      now,
      transaction,
    })

    const refreshTokenEntity = await this.saveRefreshToken({
      customerId,
      sessionKey,
      refreshToken,
      now,
      transaction,
    })

    return {
      accessTokenEntity,
      refreshTokenEntity,
      refreshToken,
    }
  }

  /**
   * Save the access token half of a pair.
   *
   * @param {{
   *   customerId: number
   *   sessionKey: string
   *   now: Date
   *   transaction: Transaction
   * }} params - Parameters.
   * @returns {Promise<AccessTokenEntity>} - The saved access token entity.
   */
  async saveAccessToken ({
    customerId,
    sessionKey,
    now,
    transaction,
  }) {
    const accessTokenEntity = this.AccessTokenModel.buildWithGeneratedAttributes({
      customerId,
      sessionKey,
      generatedAt: now,
    })

    return /** @type {Promise<AccessTokenEntity>} */ (
      accessTokenEntity.save({
        transaction,
      })
    )
  }

  /**
   * Save the refresh token half of a pair.
   *
   * @param {{
   *   customerId: number
   *   sessionKey: string
   *   refreshToken: string
   *   now: Date
   *   transaction: Transaction
   * }} params - Parameters.
   * @returns {Promise<RefreshTokenEntity>} - The saved refresh token entity.
   */
  async saveRefreshToken ({
    customerId,
    sessionKey,
    refreshToken,
    now,
    transaction,
  }) {
    const refreshTokenEntity = this.RefreshTokenModel.buildWithGeneratedAttributes({
      customerId,
      sessionKey,
      refreshToken,
      generatedAt: now,
    })

    return /** @type {Promise<RefreshTokenEntity>} */ (
      refreshTokenEntity.save({
        transaction,
      })
    )
  }

  /**
   * Find the row a presented refresh token belongs to.
   *
   * The presented value is hashed before the lookup, because the table stores digests.
   *
   * @param {{
   *   refreshToken: string | null
   * }} params - Parameters.
   * @returns {Promise<RefreshTokenEntity | null>} - Refresh token entity, or null when it matches nothing.
   * @public
   */
  async findRefreshToken ({
    refreshToken,
  }) {
    if (!refreshToken) {
      return null
    }

    const entity = /** @type {RefreshTokenEntity | null} */ (
      await this.RefreshTokenModel.findOne({
        where: {
          tokenHash: this.RefreshTokenModel.hashToken({
            token: refreshToken,
          }),
        },
      })
    )

    return entity
      ?? null
  }

  /**
   * Rotate a session: spend the presented refresh token and issue the next pair in the same series.
   * Spending and re-issuing share one transaction, so a throw rolls both back and is returned as the `error`.
   *
   * @param {{
   *   refreshTokenEntity: RefreshTokenEntity
   *   now: Date
   * }} params - Parameters.
   * @returns {Promise<SessionSavingResult>} - The error (null on success) and the next pair.
   * @public
   */
  async rotateSession ({
    refreshTokenEntity,
    now,
  }) {
    try {
      const credentialPair = await this.AccessTokenModel
        .beginTransaction(async transaction => {
          await this.spendRefreshToken({
            tokenHash: refreshTokenEntity.tokenHash,
            now,
            transaction,
          })

          return this.saveTokenPair({
            customerId: refreshTokenEntity.CustomerId,
            sessionKey: refreshTokenEntity.sessionKey,
            now,
            transaction,
          })
        })

      return SessionSavingResult.create({
        error: null,
        credentialPair,
      })
    } catch (error) {
      return SessionSavingResult.create({
        error,
        credentialPair: null,
      })
    }
  }

  /**
   * Mark a refresh token spent, so presenting it again is detectable. Keyed on the unique token
   * digest, so it marks exactly the one row. Throwable; runs inside a caller-opened transaction.
   *
   * @param {{
   *   tokenHash: string
   *   now: Date
   *   transaction: Transaction
   * }} params - Parameters.
   * @returns {Promise<[number]>} - Sequelize bulk-update result: [number of rows marked spent].
   */
  async spendRefreshToken ({
    tokenHash,
    now,
    transaction,
  }) {
    return this.RefreshTokenModel.update(
      {
        usedAt: now,
      },
      {
        where: {
          tokenHash,
        },
        transaction,
      }
    )
  }

  /**
   * Revoke a whole session — every refresh token in it, and every access token it handed out.
   * Reports the outcome; on a throw the transaction is rolled back and returned as the `error`.
   *
   * @param {{
   *   sessionKey: string
   *   now: Date
   * }} params - Parameters.
   * @returns {Promise<SessionRevocationResult>} - The error (null on success) and the counts.
   * @public
   */
  async revokeSession ({
    sessionKey,
    now,
  }) {
    try {
      const revocation = await this.AccessTokenModel
        .beginTransaction(async transaction => {
          const [revokedRefreshTokenCount] = await this.revokeAllRefreshTokens({
            sessionKey,
            now,
            transaction,
          })

          const deletedAccessTokenCount = await this.deleteAllAccessTokens({
            sessionKey,
            transaction,
          })

          return {
            revokedRefreshTokenCount,
            deletedAccessTokenCount,
          }
        })

      return SessionRevocationResult.create({
        error: null,
        revocation,
      })
    } catch (error) {
      return SessionRevocationResult.create({
        error,
        revocation: null,
      })
    }
  }

  /**
   * Revoke every refresh token still live in a session. Throwable; runs inside a caller-opened
   * transaction.
   *
   * @param {{
   *   sessionKey: string
   *   now: Date
   *   transaction: Transaction
   * }} params - Parameters.
   * @returns {Promise<[number]>} - Sequelize bulk-update result: [number of refresh tokens revoked].
   */
  async revokeAllRefreshTokens ({
    sessionKey,
    now,
    transaction,
  }) {
    return this.RefreshTokenModel.update(
      {
        revokedAt: now,
      },
      {
        where: {
          sessionKey,
          revokedAt: null,
        },
        transaction,
      }
    )
  }

  /**
   * Delete every access token handed out by a session. Throwable; runs inside a caller-opened
   * transaction.
   *
   * Deleted rather than flagged — the row's absence already says it, with no extra column read on
   * the auth hot path.
   *
   * @param {{
   *   sessionKey: string
   *   transaction: Transaction
   * }} params - Parameters.
   * @returns {Promise<number>} - Number of access token rows deleted.
   */
  async deleteAllAccessTokens ({
    sessionKey,
    transaction,
  }) {
    return this.AccessTokenModel.destroy({
      where: {
        sessionKey,
      },
      transaction,
    })
  }
}

/**
 * @typedef {import('sequelize').Transaction} Transaction
 */

/**
 * @typedef {typeof import('../../sequelize/models/CustomerAccessToken.js').default} AccessTokenModelClass
 */

/**
 * @typedef {typeof import('../../sequelize/models/CustomerRefreshToken.js').default} RefreshTokenModelClass
 */

/**
 * @typedef {import('../../sequelize/models/CustomerAccessToken.js').CustomerAccessTokenEntity} AccessTokenEntity
 */

/**
 * @typedef {import('../../sequelize/models/CustomerRefreshToken.js').CustomerRefreshTokenEntity} RefreshTokenEntity
 */

/**
 * @typedef {{
 *   AccessTokenModel: AccessTokenModelClass
 *   RefreshTokenModel: RefreshTokenModelClass
 *   credentialClerk: SessionCredentialClerk
 * }} SessionClerkParams
 */

/**
 * @typedef {{
 *   AccessTokenModel: AccessTokenModelClass
 *   RefreshTokenModel: RefreshTokenModelClass
 *   credentialClerk?: SessionCredentialClerk
 * }} SessionClerkFactoryParams
 */

/**
 * The saved token records of one pair, plus the plain refresh token — the plaintext is not on the
 * record (only its digest is stored), so it is handed back alongside for the caller to set as a
 * cookie.
 *
 * @typedef {{
 *   accessTokenEntity: AccessTokenEntity
 *   refreshTokenEntity: RefreshTokenEntity
 *   refreshToken: string
 * }} SessionCredentialPair
 */
