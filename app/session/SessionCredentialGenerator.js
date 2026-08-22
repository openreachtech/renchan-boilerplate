import crypto from 'crypto'

const DEFAULT_TOKEN_BYTE_SIZE = 32
const HASH_ALGORITHM = 'sha256'

/**
 * Mints and digests the values a session is made of.
 *
 * **Why not a `Math.random()`-based generator.** Such helpers pick characters with
 * `Math.random()`, which is not a cryptographic generator: its output is a deterministic
 * sequence, so observing enough tokens narrows down the ones that come next. Tokens are minted
 * from `crypto.randomBytes(32)` instead, where predictability is not an option.
 *
 * **Why refresh tokens are stored as digests.** The refresh token is the long-lived half of the
 * pair, so a leaked database dump would otherwise be a set of working sessions. Storing the
 * digest means the stored value cannot be presented; the lookup hashes what arrives and matches
 * on that. Access tokens are kept as-is — they are minutes from expiring, and hashing them would
 * cost a digest on every single request for a window that closes on its own.
 */
export default class SessionCredentialGenerator {
  /**
   * Constructor.
   *
   * @param {SessionCredentialGeneratorParams} params - Parameters.
   */
  constructor ({
    tokenByteSize,
  }) {
    this.tokenByteSize = tokenByteSize
  }

  /**
   * Factory method.
   *
   * @template {X extends typeof SessionCredentialGenerator ? X : never} T, X
   * @param {SessionCredentialGeneratorFactoryParams} [params] - Parameters.
   * @returns {InstanceType<T>} - Instance of this class.
   * @this {T}
   */
  static create ({
    tokenByteSize = DEFAULT_TOKEN_BYTE_SIZE,
  } = {}) {
    return /** @type {InstanceType<T>} */ (
      new this({
        tokenByteSize,
      })
    )
  }

  /**
   * Generate a token.
   *
   * @returns {string} - Token, as lower case hex.
   */
  generateToken () {
    return crypto
      .randomBytes(this.tokenByteSize)
      .toString('hex')
  }

  /**
   * Generate the key that binds one sign-in's tokens into a series.
   *
   * It is generated the same way as a token because it is guessable-by-design nowhere: knowing a
   * series key must not let anyone name a series they do not hold.
   *
   * @returns {string} - Session key, as lower case hex.
   */
  generateSessionKey () {
    return this.generateToken()
  }

  /**
   * Digest a token for storage and lookup.
   *
   * @param {{
   *   token: string
   * }} params - Parameters.
   * @returns {string} - Digest, as lower case hex.
   */
  hashToken ({
    token,
  }) {
    return crypto
      .createHash(HASH_ALGORITHM)
      .update(token)
      .digest('hex')
  }
}

/**
 * @typedef {{
 *   tokenByteSize: number
 * }} SessionCredentialGeneratorParams
 */

/**
 * @typedef {Partial<SessionCredentialGeneratorParams>} SessionCredentialGeneratorFactoryParams
 */
