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
   * Start a new session, in a series of its own.
   *
   * @param {{
   *   customerId: number
   *   now: Date
   *   transaction: Transaction
   * }} params - Parameters.
   * @returns {Promise<SessionCredentialPair>} - The pair handed to the client.
   * @public
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
   *   transaction: Transaction
   * }} params - Parameters.
   * @returns {Promise<SessionCredentialPair>} - The pair handed to the client.
   * @public
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
   *   presentedRefreshToken: string | null
   * }} params - Parameters.
   * @returns {Promise<RefreshTokenEntity | null>} - Refresh token entity, or null when it matches nothing.
   * @public
   */
  async findRefreshTokenEntity ({
    presentedRefreshToken,
  }) {
    if (!presentedRefreshToken) {
      return null
    }

    const entity = /** @type {RefreshTokenEntity | null} */ (
      await this.RefreshTokenModel.findOne({
        where: {
          tokenHash: this.RefreshTokenModel.hashToken({
            token: presentedRefreshToken,
          }),
        },
      })
    )

    return entity
      ?? null
  }

  /**
   * Mark a refresh token as spent, so presenting it again is detectable.
   *
   * @param {{
   *   refreshTokenEntity: RefreshTokenEntity
   *   now: Date
   *   transaction: Transaction
   * }} params - Parameters.
   * @returns {Promise<RefreshTokenEntity>} - The refresh token, now marked spent.
   * @public
   */
  async consumeRefreshToken ({
    refreshTokenEntity,
    now,
    transaction,
  }) {
    return /** @type {Promise<RefreshTokenEntity>} */ (
      refreshTokenEntity.update(
        {
          usedAt: now,
        },
        {
          transaction,
        }
      )
    )
  }

  /**
   * Revoke a whole series — every refresh token in it, and every access token handed out by it.
   *
   * @param {{
   *   sessionKey: string
   *   now: Date
   *   transaction: Transaction
   * }} params - Parameters.
   * @returns {Promise<SeriesRevocationResult>} - How many refresh tokens were revoked and access tokens deleted.
   * @public
   */
  async revokeSeries ({
    sessionKey,
    now,
    transaction,
  }) {
    const [revokedRefreshTokenCount] = await this.revokeRefreshTokensInSeries({
      sessionKey,
      now,
      transaction,
    })

    const deletedAccessTokenCount = await this.deleteAccessTokensInSeries({
      sessionKey,
      transaction,
    })

    return {
      revokedRefreshTokenCount,
      deletedAccessTokenCount,
    }
  }

  /**
   * Revoke every refresh token still live in a series.
   *
   * @param {{
   *   sessionKey: string
   *   now: Date
   *   transaction: Transaction
   * }} params - Parameters.
   * @returns {Promise<[number]>} - Sequelize bulk-update result: [number of refresh tokens revoked].
   */
  async revokeRefreshTokensInSeries ({
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
   * Delete every access token handed out by a series.
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
  async deleteAccessTokensInSeries ({
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
 * }} SessionRegistererParams
 */

/**
 * @typedef {{
 *   AccessTokenModel: AccessTokenModelClass
 *   RefreshTokenModel: RefreshTokenModelClass
 *   credentialClerk?: SessionCredentialClerk
 * }} SessionRegistererFactoryParams
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

/**
 * How much a series revocation removed — the refresh tokens marked revoked, and the access token
 * rows deleted.
 *
 * @typedef {{
 *   revokedRefreshTokenCount: number
 *   deletedAccessTokenCount: number
 * }} SeriesRevocationResult
 */
