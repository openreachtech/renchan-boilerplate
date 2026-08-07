/**
 * Finds the refresh token row a presented value belongs to.
 *
 * The table is injected, not imported, so both audiences share one implementation. Read-only: it
 * reports what it finds and leaves error-naming to the resolver.
 */
export default class RefreshTokenFinder {
  /**
   * Constructor.
   *
   * @param {RefreshTokenFinderParams} params - Parameters.
   */
  constructor ({
    RefreshTokenModel,
  }) {
    this.RefreshTokenModel = RefreshTokenModel
  }

  /**
   * Factory method.
   *
   * @template {X extends typeof RefreshTokenFinder ? X : never} T, X
   * @param {RefreshTokenFinderParams} params - Parameters.
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
}

/**
 * @typedef {typeof import('../../sequelize/models/CustomerRefreshToken.js').default} RefreshTokenModelClass
 */

/**
 * @typedef {import('../../sequelize/models/CustomerRefreshToken.js').CustomerRefreshTokenEntity} RefreshTokenEntity
 */

/**
 * @typedef {{
 *   RefreshTokenModel: RefreshTokenModelClass
 * }} RefreshTokenFinderParams
 */
