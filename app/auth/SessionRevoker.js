/**
 * Revokes a whole session series — every refresh token in it, and every access token it handed out.
 *
 * The tables are injected, not imported, so both audiences share one implementation; every write
 * takes a transaction.
 */
export default class SessionRevoker {
  /**
   * Constructor.
   *
   * @param {SessionRevokerParams} params - Parameters.
   */
  constructor ({
    AccessTokenModel,
    RefreshTokenModel,
  }) {
    this.AccessTokenModel = AccessTokenModel
    this.RefreshTokenModel = RefreshTokenModel
  }

  /**
   * Factory method.
   *
   * @template {X extends typeof SessionRevoker ? X : never} T, X
   * @param {SessionRevokerParams} params - Parameters.
   * @returns {InstanceType<T>} - Instance of this class.
   * @this {T}
   */
  static create ({
    AccessTokenModel,
    RefreshTokenModel,
  }) {
    return /** @type {InstanceType<T>} */ (
      new this({
        AccessTokenModel,
        RefreshTokenModel,
      })
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
 * @typedef {{
 *   AccessTokenModel: AccessTokenModelClass
 *   RefreshTokenModel: RefreshTokenModelClass
 * }} SessionRevokerParams
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
