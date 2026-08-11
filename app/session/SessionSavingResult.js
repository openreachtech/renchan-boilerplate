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
   * @param {SessionSavingResultFactoryParams} params
   * @returns {InstanceType<T>}
   * @this {T}
   */
  static create ({
    error,
    credentialPair,
  }) {
    return /** @type {InstanceType<T>} */ (
      new this({
        error,
        credentialPair,
      })
    )
  }

  /**
   * Check whether saving failed.
   *
   * @returns {boolean} - True when an error was caught.
   */
  hasError () {
    return this.error !== null
  }

  /**
   * Extract the caught error's message.
   *
   * @returns {string} - The error message.
   */
  extractErrorMessage () {
    return this.error.message
  }
}

/**
 * @typedef {{
 *   error: Error | null
 *   credentialPair: import('./SessionClerk.js').SessionCredentialPair | null
 * }} SessionSavingResultParams
 */

/**
 * @typedef {SessionSavingResultParams} SessionSavingResultFactoryParams
 */
