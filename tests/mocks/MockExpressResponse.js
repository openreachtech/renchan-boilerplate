/**
 * Stand-in for the Express response a middleware writes headers to.
 */
export default class MockExpressResponse {
  /**
   * Constructor.
   *
   * @param {{
   *   headerHash: Record<string, string>
   * }} params - Parameters of this constructor.
   */
  constructor ({
    headerHash,
  }) {
    this.headerHash = headerHash
  }

  /**
   * Factory method.
   *
   * @param {{
   *   headerHash?: Record<string, string>
   * }} [params] - Parameters of this factory method.
   * @returns {import('express').Response} - Express response.
   */
  static create ({
    headerHash = {},
  } = {}) {
    return /** @type {*} */ (
      new this({
        headerHash,
      })
    )
  }

  /**
   * Get the value of a header.
   *
   * @param {string} name - Header name.
   * @returns {string | undefined} - Header value.
   */
  getHeader (name) {
    return this.headerHash[name]
  }

  /**
   * Set the value of a header.
   *
   * @param {string} name - Header name.
   * @param {string} value - Header value.
   */
  setHeader (
    name,
    value
  ) {
    this.headerHash[name] = value
  }
}
