import SessionCredentialClerk from './SessionCredentialClerk.js'

/**
 * Saves, rotates and revokes the token pair a session is made of.
 *
 * The tables are injected, not imported, so both audiences share one implementation. It reports
 * what it finds and leaves error-naming to the resolver; every write takes a transaction.
 */
export default class SessionRegisterer {
  /**
   * Constructor.
   *
   * @param {SessionRegistererParams} params - Parameters.
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
   * @template {X extends typeof SessionRegisterer ? X : never} T, X
   * @param {SessionRegistererFactoryParams} params - Parameters.
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
  async saveSession ({
    customerId,
    now,
    transaction,
  }) {
    const sessionKey = this.credentialClerk.generateSessionKey()

    return this.saveTokenPair({
      customerId,
      sessionKey,
      now,
      transaction,
    })
  }

  /**
   * Save a token pair within a series.
   *
   * @param {{
   *   customerId: number
   *   sessionKey: string
   *   now: Date
   *   transaction: *
   * }} params - Parameters.
   * @returns {Promise<SessionCredentialPair>} - The pair handed to the client.
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

    await this.saveRefreshToken({
      customerId,
      sessionKey,
      refreshToken,
      now,
      transaction,
    })

    return {
      accessToken: accessTokenEntity.accessToken,
      refreshToken,
      sessionKey,
    }
  }

  /**
   * Save the access token half of a pair.
   *
   * @param {{
   *   customerId: number
   *   sessionKey: string
   *   now: Date
   *   transaction: *
   * }} params - Parameters.
   * @returns {Promise<*>} - The saved access token entity.
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

    return accessTokenEntity.save({
      transaction,
    })
  }

  /**
   * Save the refresh token half of a pair.
   *
   * @param {{
   *   customerId: number
   *   sessionKey: string
   *   refreshToken: string
   *   now: Date
   *   transaction: *
   * }} params - Parameters.
   * @returns {Promise<*>} - The saved refresh token entity.
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

    return refreshTokenEntity.save({
      transaction,
    })
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
   * Revoke a whole series — every refresh token in it, and every access token handed out by it.
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
    await this.revokeRefreshTokensInSeries({
      sessionKey,
      now,
      transaction,
    })

    await this.deleteAccessTokensInSeries({
      sessionKey,
      transaction,
    })
  }

  /**
   * Revoke every refresh token still live in a series.
   *
   * @param {{
   *   sessionKey: string
   *   now: Date
   *   transaction: *
   * }} params - Parameters.
   * @returns {Promise<void>}
   */
  async revokeRefreshTokensInSeries ({
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
  }

  /**
   * Delete every access token handed out by a series.
   *
   * Deleted rather than flagged — the row's absence already says it, with no extra column read on
   * the auth hot path.
   *
   * @param {{
   *   sessionKey: string
   *   transaction: *
   * }} params - Parameters.
   * @returns {Promise<void>}
   */
  async deleteAccessTokensInSeries ({
    sessionKey,
    transaction,
  }) {
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
 * }} SessionRegistererParams
 */

/**
 * @typedef {{
 *   AccessTokenModel: *
 *   RefreshTokenModel: *
 *   credentialClerk?: SessionCredentialClerk
 * }} SessionRegistererFactoryParams
 */

/**
 * @typedef {{
 *   accessToken: string
 *   refreshToken: string
 *   sessionKey: string
 * }} SessionCredentialPair
 */
