import SessionCredentialGenerator from './SessionCredentialGenerator.js'
import SavingSessionResult from './SavingSessionResult.js'
import RevokingSessionResult from './RevokingSessionResult.js'

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
    credentialGenerator,
  }) {
    this.AccessTokenModel = AccessTokenModel
    this.RefreshTokenModel = RefreshTokenModel
    this.credentialGenerator = credentialGenerator
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
    credentialGenerator = this.createCredentialGenerator(),
  }) {
    return /** @type {InstanceType<T>} */ (
      new this({
        AccessTokenModel,
        RefreshTokenModel,
        credentialGenerator,
      })
    )
  }

  /**
   * get: RevokingSessionResult class — a seam so tests can substitute it.
   *
   * @returns {typeof RevokingSessionResult} - The class.
   */
  static get RevokingSessionResultCtor () {
    return RevokingSessionResult
  }

  /**
   * get: SavingSessionResult class — a seam so tests can substitute it.
   *
   * @returns {typeof SavingSessionResult} - The class.
   */
  static get SavingSessionResultCtor () {
    return SavingSessionResult
  }

  /**
   * get: SessionCredentialGenerator class — a seam so tests can substitute it.
   *
   * @returns {typeof SessionCredentialGenerator} - The class.
   */
  static get SessionCredentialGeneratorCtor () {
    return SessionCredentialGenerator
  }

  /**
   * Create session credential clerk.
   *
   * @returns {SessionCredentialGenerator} - Session credential clerk.
   */
  static createCredentialGenerator () {
    return this.SessionCredentialGeneratorCtor.create()
  }

  /**
   * Create a revoking-session result.
   *
   * @param {{
   *   response?: import('./RevokingSessionResult.js').SessionRevocationCounts | null
   *   error?: Error | null
   * }} params
   * @returns {RevokingSessionResult}
   */
  static createRevokingSessionResult ({
    response = null,
    error = null,
  }) {
    return this.RevokingSessionResultCtor.create({
      response,
      error,
    })
  }

  /**
   * Create a saving-session result.
   *
   * @param {{
   *   response?: SessionCredentialPair | null
   *   error?: Error | null
   * }} params
   * @returns {SavingSessionResult}
   */
  static createSavingSessionResult ({
    response = null,
    error = null,
  }) {
    return this.SavingSessionResultCtor.create({
      response,
      error,
    })
  }

  /**
   * get: Class itself — reach own statics through the instance.
   *
   * @returns {typeof SessionClerk} - The class.
   */
  get Ctor () {
    return /** @type {typeof SessionClerk} */ (this.constructor)
  }

  /**
   * Start a session's token pair, in a series of its own. Never throws — the outcome is always a
   * `SavingSessionResult`. Pass a `transaction` to join an outer one (the caller then decides
   * rollback via `result.hasError()`); omit it to self-resolve a transaction here.
   *
   * @param {{
   *   userId: number
   *   now: Date
   *   sessionKey?: string
   *   transaction?: Transaction | null
   * }} params - Parameters.
   * @returns {Promise<SavingSessionResult>} - The error (null on success) and the saved pair.
   * @public
   */
  async saveSession ({
    userId,
    now,
    sessionKey = this.credentialGenerator.generateSessionKey(),
    transaction = null,
  }) {
    if (!transaction) {
      return this.invokeSaveSession({
        userId,
        sessionKey,
        now,
      })
    }

    try {
      const credentialPair = await this.saveTokenPair({
        userId,
        sessionKey,
        now,
        transaction,
      })

      return this.Ctor.createSavingSessionResult({
        response: credentialPair,
      })
    } catch (error) {
      return this.Ctor.createSavingSessionResult({
        error,
      })
    }
  }

  /**
   * Invoke `saveSession` inside a transaction resolved here, rolling back on a reported error.
   *
   * @param {{
   *   userId: number
   *   sessionKey: string
   *   now: Date
   * }} params - Parameters.
   * @returns {Promise<SavingSessionResult>} - The error (null on success) and the saved pair.
   */
  async invokeSaveSession ({
    userId,
    sessionKey,
    now,
  }) {
    try {
      return await this.AccessTokenModel
        .beginTransaction(async transaction => {
          const result = await this.saveSession({
            userId,
            sessionKey,
            now,
            transaction,
          })

          if (result.hasError()) {
            throw result.error
          }

          return result
        })
    } catch (error) {
      return this.Ctor.createSavingSessionResult({
        error,
      })
    }
  }

  /**
   * Save both halves of a pair within a series. Throwable; runs inside a caller-opened transaction.
   *
   * @param {{
   *   userId: number
   *   sessionKey: string
   *   now: Date
   *   transaction: Transaction
   * }} params - Parameters.
   * @returns {Promise<SessionCredentialPair>} - The saved pair, plus the plain refresh token.
   */
  async saveTokenPair ({
    userId,
    sessionKey,
    now,
    transaction,
  }) {
    const refreshToken = this.credentialGenerator.generateToken()

    const accessTokenEntity = await this.saveAccessToken({
      userId,
      sessionKey,
      now,
      transaction,
    })

    const refreshTokenEntity = await this.saveRefreshToken({
      userId,
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
   *   userId: number
   *   sessionKey: string
   *   now: Date
   *   transaction: Transaction
   * }} params - Parameters.
   * @returns {Promise<AccessTokenEntity>} - The saved access token entity.
   */
  async saveAccessToken ({
    userId,
    sessionKey,
    now,
    transaction,
  }) {
    const accessTokenEntity = this.AccessTokenModel.buildWithGeneratedAttributes({
      userId,
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
   *   userId: number
   *   sessionKey: string
   *   refreshToken: string
   *   now: Date
   *   transaction: Transaction
   * }} params - Parameters.
   * @returns {Promise<RefreshTokenEntity>} - The saved refresh token entity.
   */
  async saveRefreshToken ({
    userId,
    sessionKey,
    refreshToken,
    now,
    transaction,
  }) {
    const refreshTokenEntity = this.RefreshTokenModel.buildWithGeneratedAttributes({
      userId,
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
   * Never throws — the outcome is always a `SavingSessionResult`. Pass a `transaction` to join an
   * outer one (the caller then decides rollback via `result.hasError()`); omit it to self-resolve.
   *
   * @param {{
   *   refreshTokenEntity: RefreshTokenEntity
   *   now: Date
   *   transaction?: Transaction | null
   * }} params - Parameters.
   * @returns {Promise<SavingSessionResult>} - The error (null on success) and the next pair.
   * @public
   */
  async rotateSession ({
    refreshTokenEntity,
    now,
    transaction = null,
  }) {
    if (!transaction) {
      return this.invokeRotateSession({
        refreshTokenEntity,
        now,
      })
    }

    try {
      const [updatedCount] = await this.spendRefreshToken({
        tokenHash: refreshTokenEntity.tokenHash,
        now,
        transaction,
      })

      if (updatedCount === 0) {
        return this.Ctor.createSavingSessionResult({
          error: new Error('The refresh token was already spent'),
        })
      }

      const credentialPair = await this.saveTokenPair({
        userId: refreshTokenEntity.extractUserId(),
        sessionKey: refreshTokenEntity.sessionKey,
        now,
        transaction,
      })

      return this.Ctor.createSavingSessionResult({
        response: credentialPair,
      })
    } catch (error) {
      return this.Ctor.createSavingSessionResult({
        error,
      })
    }
  }

  /**
   * Invoke `rotateSession` inside a transaction resolved here, rolling back on a reported error.
   *
   * @param {{
   *   refreshTokenEntity: RefreshTokenEntity
   *   now: Date
   * }} params - Parameters.
   * @returns {Promise<SavingSessionResult>} - The error (null on success) and the next pair.
   */
  async invokeRotateSession ({
    refreshTokenEntity,
    now,
  }) {
    try {
      return await this.AccessTokenModel
        .beginTransaction(async transaction => {
          const result = await this.rotateSession({
            refreshTokenEntity,
            now,
            transaction,
          })

          if (result.hasError()) {
            throw result.error
          }

          return result
        })
    } catch (error) {
      return this.Ctor.createSavingSessionResult({
        error,
      })
    }
  }

  /**
   * Mark a refresh token spent, so presenting it again is detectable. Keyed on the unique token
   * digest and guarded on `usedAt: null`, so it marks exactly the one still-unused row (re-spending
   * updates nothing). Throwable; runs inside a caller-opened transaction.
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
          usedAt: null,
        },
        transaction,
      }
    )
  }

  /**
   * Revoke a whole session — every refresh token in it, and every access token it handed out.
   * Never throws — the outcome is always a `RevokingSessionResult`. Pass a `transaction` to join
   * an outer one (the caller then decides rollback via `result.hasError()`); omit it to self-resolve.
   *
   * @param {{
   *   sessionKey: string
   *   now: Date
   *   transaction?: Transaction | null
   * }} params - Parameters.
   * @returns {Promise<RevokingSessionResult>} - The error (null on success) and the counts.
   * @public
   */
  async revokeSession ({
    sessionKey,
    now,
    transaction = null,
  }) {
    if (!transaction) {
      return this.invokeRevokeSession({
        sessionKey,
        now,
      })
    }

    try {
      const [revokedRefreshTokenCount] = await this.revokeAllRefreshTokens({
        sessionKey,
        now,
        transaction,
      })

      const deletedAccessTokenCount = await this.deleteAllAccessTokens({
        sessionKey,
        transaction,
      })

      const revocation = {
        revokedRefreshTokenCount,
        deletedAccessTokenCount,
      }

      return this.Ctor.createRevokingSessionResult({
        response: revocation,
      })
    } catch (error) {
      return this.Ctor.createRevokingSessionResult({
        error,
      })
    }
  }

  /**
   * Invoke `revokeSession` inside a transaction resolved here, rolling back on a reported error.
   *
   * @param {{
   *   sessionKey: string
   *   now: Date
   * }} params - Parameters.
   * @returns {Promise<RevokingSessionResult>} - The error (null on success) and the counts.
   */
  async invokeRevokeSession ({
    sessionKey,
    now,
  }) {
    try {
      return await this.AccessTokenModel
        .beginTransaction(async transaction => {
          const result = await this.revokeSession({
            sessionKey,
            now,
            transaction,
          })

          if (result.hasError()) {
            throw result.error
          }

          return result
        })
    } catch (error) {
      return this.Ctor.createRevokingSessionResult({
        error,
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

/*
 * SessionClerk is a general module: it depends on the `RenchanModel` base plus the few custom members
 * it calls — not on any concrete app model. Existing base members (`save` / `findOne` / `update` /
 * `destroy` / `beginTransaction`) come from `RenchanModel` and are never re-declared here.
 */

/**
 * @typedef {import('@openreachtech/renchan-sequelize').RenchanModel & {
 *   accessToken: string
 * }} AccessTokenEntity
 */

/**
 * @typedef {import('@openreachtech/renchan-sequelize').RenchanModel & {
 *   tokenHash: string
 *   sessionKey: string
 *   extractUserId: () => number
 * }} RefreshTokenEntity
 */

/**
 * @typedef {typeof import('@openreachtech/renchan-sequelize').RenchanModel & {
 *   buildWithGeneratedAttributes: (params: {
 *     userId: number
 *     sessionKey: string
 *     generatedAt: Date
 *   }) => AccessTokenEntity
 * }} AccessTokenModelClass
 */

/**
 * @typedef {typeof import('@openreachtech/renchan-sequelize').RenchanModel & {
 *   buildWithGeneratedAttributes: (params: {
 *     userId: number
 *     sessionKey: string
 *     refreshToken: string
 *     generatedAt: Date
 *   }) => RefreshTokenEntity
 *   hashToken: (params: {
 *     token: string
 *   }) => string
 * }} RefreshTokenModelClass
 */

/**
 * @typedef {{
 *   AccessTokenModel: AccessTokenModelClass
 *   RefreshTokenModel: RefreshTokenModelClass
 *   credentialGenerator: SessionCredentialGenerator
 * }} SessionClerkParams
 */

/**
 * @typedef {{
 *   AccessTokenModel: AccessTokenModelClass
 *   RefreshTokenModel: RefreshTokenModelClass
 *   credentialGenerator?: SessionCredentialGenerator
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
