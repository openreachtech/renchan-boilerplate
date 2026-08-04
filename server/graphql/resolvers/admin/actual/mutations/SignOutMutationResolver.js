import {
  BaseMutationResolver,
} from '@openreachtech/renchan'

import SessionClerk from '../../../../../../app/auth/SessionClerk.js'

import AdminAccessToken from '../../../../../../sequelize/models/AdminAccessToken.js'
import AdminRefreshToken from '../../../../../../sequelize/models/AdminRefreshToken.js'

/**
 * Resolve the signOut mutation of the admin endpoint.
 *
 * Ends the session **on the server**. Discarding the credential in the browser was all a client
 * could previously do, which meant a token copied off a shared terminal stayed valid for its full
 * lifetime no matter what the person who walked away pressed.
 *
 * **Authenticates from the refresh cookie**, like `renewAccessToken`, so signing out still works
 * once the access token has expired — which is exactly when someone returning to an abandoned tab
 * needs it to.
 *
 * **Always succeeds.** A missing or unknown cookie is reported as success rather than as an
 * error: the caller's intent is satisfied either way, and answering differently would let anyone
 * probe whether a given refresh token names a live session.
 *
 * @extends {BaseMutationResolver}
 */
export default class SignOutMutationResolver extends BaseMutationResolver {
  /** @override */
  static get schema () {
    return 'signOut'
  }

  /**
   * .get:errorCodeHash
   *
   * @override
   * @returns {Record<string, string>} - Error code hash.
   */
  static get errorCodeHash () {
    return {
      ...super.errorCodeHash,
    }
  }

  /**
   * Constructor.
   *
   * @param {{
   *   sessionClerk: SessionClerk
   *   errorHash: *
   * }} params - Parameters.
   */
  constructor ({
    sessionClerk,
    ...restParams
  }) {
    super(restParams)

    this.sessionClerk = sessionClerk
  }

  /**
   * Factory method.
   *
   * @param {{
   *   sessionClerk?: SessionClerk
   *   errorCodeHash?: Record<string, string>
   * }} [params] - Parameters.
   * @returns {SignOutMutationResolver} - Instance of this class.
   */
  static create ({
    sessionClerk = this.createSessionClerk(),
    errorCodeHash = this.errorCodeHash,
  } = {}) {
    return /** @type {*} */ (
      new this({
        sessionClerk,
        errorHash: this.buildErrorHash({
          errorCodeHash,
        }),
      })
    )
  }

  /**
   * Create session clerk bound to the admin tables.
   *
   * @returns {SessionClerk} - Session clerk.
   */
  static createSessionClerk () {
    return SessionClerk.create({
      AccessTokenModel: AdminAccessToken,
      RefreshTokenModel: AdminRefreshToken,
    })
  }

  /**
   * Resolve the signOut mutation.
   *
   * @override
   * @param {{
   *   context: import('../../../../contexts/AdminGraphqlContext.js').default
   * }} params - Parameters.
   * @returns {Promise<{
   *   signedOut: boolean
   * }>} - Always signed out.
   */
  async resolve ({
    context,
  }) {
    const refreshTokenEntity = await this.sessionClerk.findRefreshTokenEntity({
      presentedRefreshToken: context.extractRefreshToken(),
    })

    // The cookie goes either way. Leaving it behind when it matches no row would keep the
    // browser presenting a value that can only ever fail.
    context.clearRefreshTokenCookie()

    if (!refreshTokenEntity) {
      return this.formatResponse()
    }

    await this.revokeSession({
      context,
      refreshTokenEntity,
    })

    return this.formatResponse()
  }

  /**
   * Revoke the series the presented token belongs to.
   *
   * @param {{
   *   context: import('../../../../contexts/AdminGraphqlContext.js').default
   *   refreshTokenEntity: *
   * }} params - Parameters.
   * @returns {Promise<void>}
   * @throws {Error} - Throws error if transaction fails.
   */
  async revokeSession ({
    context,
    refreshTokenEntity,
  }) {
    const transactionCallback = this.generateTransactionCallback({
      sessionKey: refreshTokenEntity.sessionKey,
      now: context.now,
    })

    await AdminAccessToken.beginTransaction(transactionCallback)
  }

  /**
   * Generate transaction callback.
   *
   * @param {{
   *   sessionKey: string
   *   now: Date
   * }} params - Parameters.
   * @returns {function(*): Promise<void>}
   */
  generateTransactionCallback ({
    sessionKey,
    now,
  }) {
    return async transaction =>
      this.sessionClerk.revokeSeries({
        sessionKey,
        now,
        transaction,
      })
  }

  /**
   * Format response.
   *
   * @returns {{
   *   signedOut: boolean
   * }}
   */
  formatResponse () {
    return {
      signedOut: true,
    }
  }
}
