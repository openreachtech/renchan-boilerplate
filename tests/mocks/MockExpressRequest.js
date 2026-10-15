/**
 * Stand-in for the Express request a middleware reads.
 */
export default class MockExpressRequest {
  /**
   * Constructor.
   *
   * @param {{
   *   method: string
   *   headers: Record<string, string>
   * }} params - Parameters of this constructor.
   */
  constructor ({
    method,
    headers,
  }) {
    this.method = method
    this.headers = headers
  }

  /**
   * Factory method.
   *
   * @param {{
   *   method: string
   *   origin: string
   * }} params - Parameters of this factory method.
   * @returns {import('express').Request} - Express request.
   */
  static create ({
    method,
    origin,
  }) {
    return /** @type {*} */ (
      new this({
        method,
        headers: {
          origin,
        },
      })
    )
  }
}
