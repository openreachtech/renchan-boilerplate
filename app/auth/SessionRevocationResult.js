/**
 * The outcome of revoking a session — the caught error (null on success) and the removal counts
 * (null on failure). Returned as an instance so the interface is a proper type, not a loose plain
 * object.
 */
export default class SessionRevocationResult {
  /**
   * Constructor.
   *
   * @param {SessionRevocationResultParams} params
   */
  constructor ({
    error,
    revocation,
  }) {
    this.error = error
    this.revocation = revocation
  }

  /**
   * Factory method.
   *
   * @template {X extends typeof SessionRevocationResult ? X : never} T, X
   * @param {SessionRevocationResultParams} params
   * @returns {InstanceType<T>}
   * @this {T}
   */
  static create (params) {
    return /** @type {InstanceType<T>} */ (
      new this(params)
    )
  }
}

/**
 * How much a session revocation removed — the refresh tokens marked revoked, and the access token
 * rows deleted.
 *
 * @typedef {{
 *   revokedRefreshTokenCount: number
 *   deletedAccessTokenCount: number
 * }} SessionRevocationCounts
 */

/**
 * @typedef {{
 *   error: Error | null
 *   revocation: SessionRevocationCounts | null
 * }} SessionRevocationResultParams
 */
