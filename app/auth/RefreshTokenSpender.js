/**
 * Marks a refresh token spent, so presenting it again is detectable.
 *
 * The table is injected, not imported, so both audiences share one implementation; the write takes
 * a transaction.
 */
export default class RefreshTokenSpender {
  /**
   * Constructor.
   *
   * @param {RefreshTokenSpenderParams} params - Parameters.
   */
  constructor ({
    RefreshTokenModel,
  }) {
    this.RefreshTokenModel = RefreshTokenModel
  }

  /**
   * Factory method.
   *
   * @template {X extends typeof RefreshTokenSpender ? X : never} T, X
   * @param {RefreshTokenSpenderParams} params - Parameters.
   * @returns {InstanceType<T>} - Instance of this class.
   * @this {T}
   */
  static create ({
    RefreshTokenModel,
  }) {
    return /** @type {InstanceType<T>} */ (
      new this({
        RefreshTokenModel,
      })
    )
  }

  /**
   * Mark a refresh token spent, so presenting it again is detectable.
   *
   * Keyed on the unique token digest, so it marks exactly the one row.
   *
   * @param {{
   *   refreshTokenEntity: RefreshTokenEntity
   *   now: Date
   *   transaction: Transaction
   * }} params - Parameters.
   * @returns {Promise<[number]>} - Sequelize bulk-update result: [number of rows marked spent].
   * @public
   */
  async spendRefreshToken ({
    refreshTokenEntity,
    now,
    transaction,
  }) {
    return this.RefreshTokenModel.update(
      {
        usedAt: now,
      },
      {
        where: {
          tokenHash: refreshTokenEntity.tokenHash,
        },
        transaction,
      }
    )
  }
}

/**
 * @typedef {import('sequelize').Transaction} Transaction
 */

/**
 * @typedef {typeof import('../../sequelize/models/CustomerRefreshToken.js').default} RefreshTokenModelClass
 */

/**
 * @typedef {import('../../sequelize/models/CustomerRefreshToken.js').CustomerRefreshTokenEntity} RefreshTokenEntity
 */

/**
 * @typedef {{
 *   RefreshTokenModel: RefreshTokenModelClass
 * }} RefreshTokenSpenderParams
 */
