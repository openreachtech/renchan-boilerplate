/**
 * The outcome of a session operation — the operation's response (null on failure) and the caught
 * error (null on success). Returned as an instance so the interface is a proper type, not a loose
 * plain object; a subclass fixes what `response` carries. The field is named generically, so this
 * result travels unchanged when the session clerk is later cut out as its own module.
 *
 * @template R
 */
export default class BaseSessionResult {
  /**
   * Constructor.
   *
   * @param {{
   *   response: R | null
   *   error: Error | null
   * }} params
   */
  constructor ({
    response,
    error,
  }) {
    this.response = response
    this.error = error
  }

  /**
   * Factory method.
   *
   * @template {X extends typeof BaseSessionResult ? X : never} T, X
   * @template R
   * @param {{
   *   response?: R | null
   *   error?: Error | null
   * }} params
   * @returns {InstanceType<T>}
   * @this {T}
   */
  static create ({
    response = null,
    error = null,
  }) {
    return /** @type {InstanceType<T>} */ (
      new this({
        response,
        error,
      })
    )
  }

  /**
   * Check whether the operation failed.
   *
   * @returns {boolean} - True when an error was caught.
   */
  hasError () {
    return this.error instanceof Error
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
