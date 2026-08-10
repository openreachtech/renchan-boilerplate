/**
 * The outcome of saving or rotating a session — the caught error (null on success) and the saved
 * credential pair (null on failure). Returned as an instance so the interface is a proper type,
 * not a loose plain object.
 */
export default class SessionSavingResult {
  /**
   * Constructor.
   *
   * @param {SessionSavingResultParams} params
   */
  constructor ({
    error,
    credentialPair,
  }) {
    this.error = error
    this.credentialPair = credentialPair
  }

  /**
   * Factory method.
   *
   * @template {X extends typeof SessionSavingResult ? X : never} T, X
   * @param {SessionSavingResultParams} params
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
 * @typedef {{
 *   error: Error | null
 *   credentialPair: import('./SessionClerk.js').SessionCredentialPair | null
 * }} SessionSavingResultParams
 */
