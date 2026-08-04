import SessionCredentialClerk from './SessionCredentialClerk.js'

/**
 * Issues, rotates and revokes the token pair a session is made of.
 *
 * The two audiences run the same protocol over different tables, so the tables are injected
 * rather than imported: one implementation, two bindings.
 *
 * **This class does not decide errors.** It reports what it found and leaves the naming of the
 * failure to the resolver, which owns the error hash. That is why `#findRefreshTokenEntity()`
 * answers with the row rather than throwing — whether a spent row is unauthenticated or a reuse
 * is a contract decision, not a storage one.
 *
 * **Every write takes a transaction.** Rotation marks one row spent and writes two others; if
 * that were to half-happen, the client would hold a refresh token the server no longer honours
 * and the session would be unrecoverable without signing in again.
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
   * Create session credential clerk.
   *
   * @returns {SessionCredentialClerk} - Session credential clerk.
   */
  static createCredentialClerk () {
    return SessionCredentialClerk.create()
  }

  /**
   * Start a new session, in a series of its own.
   *
   * @param {{
   *   customerId: number
   *   now: Date
   *   transaction: *
   * }} params - Parameters.
   * @returns {Promise<SessionCredentialPair>} - The pair handed to the client.
   */
  async issueSession ({
    customerId,
    now,
    transaction,
  }) {
    return this.issueTokens({
      customerId,
      sessionKey: this.credentialClerk.generateSessionKey(),
      now,
      transaction,
    })
  }

  /**
   * Issue a token pair within a series.
   *
   * @param {{
   *   customerId: number
   *   sessionKey: string
   *   now: Date
   *   transaction: *
   * }} params - Parameters.
   * @returns {Promise<SessionCredentialPair>} - The pair handed to the client.
   */
  async issueTokens ({
    customerId,
    sessionKey,
    now,
    transaction,
  }) {
    const refreshToken = this.credentialClerk.generateToken()

    const accessTokenEntity = await this.AccessTokenModel
      .buildWithGeneratedAttributes({
        customerId,
        sessionKey,
        generatedAt: now,
      })
      .save({
        transaction,
      })

    await this.RefreshTokenModel
      .buildWithGeneratedAttributes({
        customerId,
        sessionKey,
        refreshToken,
        generatedAt: now,
      })
      .save({
        transaction,
      })

    return {
      accessToken: accessTokenEntity.accessToken,
      refreshToken,
      sessionKey,
    }
  }

  /**
   * Find the row a presented refresh token belongs to.
   *
   * The presented value is hashed before the lookup, because the table stores digests.
   *
   * @param {{
   *   presentedRefreshToken: string | null
   * }} params - Parameters.
   * @returns {Promise<*>} - Refresh token entity, or null when it matches nothing.
   */
  async findRefreshTokenEntity ({
    presentedRefreshToken,
  }) {
    if (!presentedRefreshToken) {
      return null
    }

    const entity = await this.RefreshTokenModel.findOne({
      where: {
        tokenHash: this.RefreshTokenModel.hashToken({
          token: presentedRefreshToken,
        }),
      },
    })

    return entity
      ?? null
  }

  /**
   * Mark a refresh token as spent, so presenting it again is detectable.
   *
   * @param {{
   *   refreshTokenEntity: *
   *   now: Date
   *   transaction: *
   * }} params - Parameters.
   * @returns {Promise<void>}
   */
  async consumeRefreshToken ({
    refreshTokenEntity,
    now,
    transaction,
  }) {
    await refreshTokenEntity.update(
      {
        usedAt: now,
      },
      {
        transaction,
      }
    )
  }

  /**
   * Revoke a whole series — every refresh token in it, and every access token issued from it.
   *
   * Access tokens are deleted rather than flagged: the lookup that authenticates a request does
   * not read a flag, and adding one would put a column read on the hot path of every request to
   * express something the row's absence already says.
   *
   * @param {{
   *   sessionKey: string
   *   now: Date
   *   transaction: *
   * }} params - Parameters.
   * @returns {Promise<void>}
   */
  async revokeSeries ({
    sessionKey,
    now,
    transaction,
  }) {
    await this.RefreshTokenModel.update(
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

    await this.AccessTokenModel.destroy({
      where: {
        sessionKey,
      },
      transaction,
    })
  }
}

/**
 * @typedef {{
 *   AccessTokenModel: *
 *   RefreshTokenModel: *
 *   credentialClerk: SessionCredentialClerk
 * }} SessionClerkParams
 */

/**
 * @typedef {{
 *   AccessTokenModel: *
 *   RefreshTokenModel: *
 *   credentialClerk?: SessionCredentialClerk
 * }} SessionClerkFactoryParams
 */

/**
 * @typedef {{
 *   accessToken: string
 *   refreshToken: string
 *   sessionKey: string
 * }} SessionCredentialPair
 */
