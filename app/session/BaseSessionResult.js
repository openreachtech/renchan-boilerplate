/**
 * The outcome of a session operation — the caught error (null on success) and the operation's
 * response (null on failure). Returned as an instance so the interface is a proper type, not a
 * loose plain object; a subclass fixes what `response` carries. The field is named generically, so
 * this result travels unchanged when the session clerk is later cut out as its own module.
 *
 * @template R
 */
export default class BaseSessionResult {
  /**
   * Constructor.
   *
   * @param {BaseSessionResultParams<R>} params
   */
  constructor ({
    error,
    response,
  }) {
    this.error = error
    this.response = response
  }

  /**
   * Factory method.
   *
   * @template {X extends typeof BaseSessionResult ? X : never} T, X
   * @template R
   * @param {BaseSessionResultParams<R>} params
   * @returns {InstanceType<T>}
   * @this {T}
   */
  static create ({
    error,
    response,
  }) {
    return /** @type {InstanceType<T>} */ (
      new this({
        error,
        response,
      })
    )
  }

  /**
   * Check whether the operation failed.
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
 *   response: R | null
 * }} BaseSessionResultParams
 * @template R
 */
