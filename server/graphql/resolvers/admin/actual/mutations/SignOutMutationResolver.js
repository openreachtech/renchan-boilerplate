import {
  BaseMutationResolver,
} from '@openreachtech/renchan'

import SessionClerk from '../../../../../../app/session/SessionClerk.js'
import RefreshTokenExpressCookieClerk from '../../../../contexts/tools/RefreshTokenExpressCookieClerk.js'

import AdminAccessToken from '../../../../../../sequelize/models/AdminAccessToken.js'
import AdminRefreshToken from '../../../../../../sequelize/models/AdminRefreshToken.js'

/**
 * Resolve the admin signOut mutation.
 *
 * Authenticates from the refresh cookie (listed in `schemasToSkipFiltering`), revokes the whole
 * series the cookie belongs to, and clears the cookie. Idempotent: a missing / unmatched cookie
 * still clears the cookie and reports success — signing out is never an error.
 *
 * @extends {BaseMutationResolver}
 */
export default class SignOutMutationResolver extends BaseMutationResolver {
  /** @override */
  static get schema () {
    return 'signOut'
  }

  /** @override */
  static get errorCodeHash () {
    return {
      ...super.errorCodeHash,
    }
  }

  /**
   * get: RefreshTokenExpressCookieClerk class — a seam so tests can substitute it.
   *
   * @returns {typeof RefreshTokenExpressCookieClerk} - The class.
   */
  get RefreshTokenExpressCookieClerkCtor () {
    return RefreshTokenExpressCookieClerk
  }

  /**
   * get: SessionClerk class — a seam so tests can substitute it.
   *
   * @returns {typeof SessionClerk} - The class.
   */
  get SessionClerkCtor () {
    return SessionClerk
  }

  /**
   * Resolve the signOut mutation.
   *
   * @override
   * @param {{
   *   context: import('../../../../contexts/AdminGraphqlContext.js').default
   * }} params - Parameters.
   * @returns {Promise<{
   *   isSignedOut: boolean
   * }>} - The sign-out result.
   */
  async resolve ({
    context,
  }) {
    const cookieClerk = this.createCookieClerk({
      context,
    })

    const sessionClerk = this.createSessionClerk()

    const refreshTokenEntity = await sessionClerk.findRefreshToken({
      refreshToken: cookieClerk.extractRefreshToken(),
    })

    const result = await this.revokeSeries({
      context,
      refreshTokenEntity,
    })

    if (result?.hasError()) {
      throw new Error(result.extractErrorMessage())
    }

    cookieClerk.clearRefreshTokenCookie()

    return this.formatResponse()
  }

  /**
   * Create refresh-token cookie clerk from the request context.
   *
   * @param {{
   *   context: import('../../../../contexts/AdminGraphqlContext.js').default
   * }} params - Parameters.
   * @returns {RefreshTokenExpressCookieClerk} - Cookie clerk.
   */
  createCookieClerk ({
    context,
  }) {
    return this.RefreshTokenExpressCookieClerkCtor.create({
      context,
    })
  }

  /**
   * Create session clerk bound to the admin tables.
   *
   * @returns {SessionClerk} - Session clerk.
   */
  createSessionClerk () {
    return this.SessionClerkCtor.create({
      AccessTokenModel: AdminAccessToken,
      RefreshTokenModel: AdminRefreshToken,
    })
  }

  /**
   * Revoke the series the presented cookie belongs to. A cookie that matched nothing is a no-op —
   * signing out stays idempotent.
   *
   * @param {{
   *   context: import('../../../../contexts/AdminGraphqlContext.js').default
   *   refreshTokenEntity: import('../../../../../../sequelize/models/AdminRefreshToken.js').AdminRefreshTokenEntity | null
   * }} params - Parameters.
   * @returns {Promise<import('../../../../../../app/session/RevokingSessionResult.js').default | null>} - The revoking outcome, or null when there was nothing to revoke.
   */
  async revokeSeries ({
    context,
    refreshTokenEntity,
  }) {
    if (!refreshTokenEntity) {
      return null
    }

    const sessionClerk = this.createSessionClerk()

    return sessionClerk.revokeSession({
      sessionKey: refreshTokenEntity.sessionKey,
      now: context.now,
    })
  }

  /**
   * Format response.
   *
   * @returns {{
   *   isSignedOut: boolean
   * }}
   */
  formatResponse () {
    return {
      isSignedOut: true,
    }
  }
}
