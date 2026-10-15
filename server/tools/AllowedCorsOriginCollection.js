/**
 * Collection of the comma-separated origins an environment variable declares for CORS.
 */
export default class AllowedCorsOriginCollection {
  /**
   * Constructor.
   *
   * @param {AllowedCorsOriginCollectionParams} params - Parameters.
   */
  constructor ({
    originsString,
  }) {
    this.originsString = originsString
  }

  /**
   * Factory method.
   *
   * @param {AllowedCorsOriginCollectionParams} params - Parameters.
   * @returns {AllowedCorsOriginCollection} - Instance.
   */
  static create ({
    originsString,
  }) {
    return new this({
      originsString,
    })
  }

  /**
   * Extract the origins, giving none for a missing or empty value.
   *
   * @returns {Array<string>} - Allowed origins.
   */
  extractOrigins () {
    if (!this.originsString) {
      return []
    }

    return this.originsString
      .split(',')
      .map(it => it.trim())
      .filter(it => it.length > 0)
  }
}

/**
 * @typedef {{
 *   originsString: string | null
 * }} AllowedCorsOriginCollectionParams
 */
