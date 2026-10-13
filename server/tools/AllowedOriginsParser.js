/**
 * Parser of the comma-separated origins an environment variable declares for CORS.
 */
export default class AllowedOriginsParser {
  /**
   * Constructor.
   *
   * @param {AllowedOriginsParserParams} params - Parameters.
   */
  constructor ({
    originsText,
  }) {
    this.originsText = originsText
  }

  /**
   * Factory method.
   *
   * @param {AllowedOriginsParserParams} params - Parameters.
   * @returns {AllowedOriginsParser} - Instance.
   */
  static create ({
    originsText,
  }) {
    return new this({
      originsText,
    })
  }

  /**
   * Parse the origins, giving none for a missing or empty value.
   *
   * @returns {Array<string>} - Allowed origins.
   */
  parseOrigins () {
    if (!this.originsText) {
      return []
    }

    return this.originsText
      .split(',')
      .map(it => it.trim())
      .filter(it => it.length > 0)
  }
}

/**
 * @typedef {{
 *   originsText: string | null
 * }} AllowedOriginsParserParams
 */
