import {
  BaseMutationResolver,
} from '@openreachtech/renchan'

import SessionRegisterer from '../../../../../../app/auth/SessionRegisterer.js'
import RefreshTokenExpressCookieClerk from '../../../../contexts/tools/RefreshTokenExpressCookieClerk.js'

import CustomerAccessToken from '../../../../../../sequelize/models/CustomerAccessToken.js'
import CustomerRefreshToken from '../../../../../../sequelize/models/CustomerRefreshToken.js'

/**
 * Resolve the renewAccessToken mutation.
 *
 * Authenticates from the refresh cookie, not the header: the access token is usually expired when
 * this runs, so it is listed in `schemasToSkipFiltering`. Rotates on every use — the presented row
 * is marked spent and a new pair issued into the same series — so a spent token presented again
 * signals a leak and revokes the whole series.
 *
 * @extends {BaseMutationResolver}
 */
export default class RenewAccessTokenMutationResolver extends BaseMutationResolver {
  /** @override */
  static get schema () {
    return 'renewAccessToken'
  }

  /** @override */
  static get errorCodeHash () {
    return {
      ...super.errorCodeHash,

      // This op skips filtering, so it raises Unauthenticated itself — reusing the engine's own
      // code so the client sees the same "sign in again" signal.
      Unauthenticated: '102.X000.001',

      RefreshTokenReused: '205.M003.001',
    }
  }

  /**
   * Resolve the renewAccessToken mutation.
   *
   * @override
   * @param {{
   *   context: import('../../../../contexts/CustomerGraphqlContext.js').default
   * }} params - Parameters.
   * @returns {Promise<{
   *   accessToken: string
   * }>} - The renewed access token.
   * @throws {Error} - Unauthenticated, or the refresh token was reused.
   */
  async resolve ({
    context,
  }) {
    const cookieClerk = this.createCookieClerk({
      context,
    })

    const sessionRegisterer = this.createSessionRegisterer()

    const refreshTokenEntity = await sessionRegisterer.findRefreshTokenEntity({
      presentedRefreshToken: cookieClerk.extractRefreshToken(),
    })

    if (!refreshTokenEntity) {
      cookieClerk.clearRefreshTokenCookie()

      throw this.errorHash.Unauthenticated.create()
    }

    if (refreshTokenEntity.isUsed()) {
      return this.handleReusedToken({
        context,
        refreshTokenEntity,
      })
    }

    if (!refreshTokenEntity.isAvailable({
      pointsAt: context.now,
    })) {
      cookieClerk.clearRefreshTokenCookie()

      throw this.errorHash.Unauthenticated.create()
    }

    const credentialPair = await this.rotateSession({
      context,
      refreshTokenEntity,
    })

    cookieClerk.saveRefreshTokenCookie({
      refreshToken: credentialPair.refreshToken,
    })

    return this.formatResponse({
      credentialPair,
    })
  }

  /**
   * Create refresh-token cookie clerk from the request context.
   *
   * @param {{
   *   context: import('../../../../contexts/CustomerGraphqlContext.js').default
   * }} params - Parameters.
   * @returns {RefreshTokenExpressCookieClerk} - Cookie clerk.
   */
  createCookieClerk ({
    context,
  }) {
    return RefreshTokenExpressCookieClerk.create({
      context,
    })
  }

  /**
   * Create session registerer bound to the customer tables.
   *
   * @returns {SessionRegisterer} - Session registerer.
   */
  createSessionRegisterer () {
    return SessionRegisterer.create({
      AccessTokenModel: CustomerAccessToken,
      RefreshTokenModel: CustomerRefreshToken,
    })
  }

  /**
   * Revoke the reused token's series, clear the cookie, and report the reuse. Extracted so no
   * `await` sits inside the `if` branch.
   *
   * @param {{
   *   context: import('../../../../contexts/CustomerGraphqlContext.js').default
   *   refreshTokenEntity: *
   * }} params - Parameters.
   * @returns {Promise<never>}
   * @throws {Error} - Always, after the reused series has been revoked.
   */
  async handleReusedToken ({
    context,
    refreshTokenEntity,
  }) {
    await this.revokeReusedSeries({
      context,
      refreshTokenEntity,
    })

    const cookieClerk = this.createCookieClerk({
      context,
    })

    cookieClerk.clearRefreshTokenCookie()

    throw this.errorHash.RefreshTokenReused.create()
  }

  /**
   * Revoke the series a reused token belongs to.
   *
   * @param {{
   *   context: import('../../../../contexts/CustomerGraphqlContext.js').default
   *   refreshTokenEntity: *
   * }} params - Parameters.
   * @returns {Promise<void>}
   */
  async revokeReusedSeries ({
    context,
    refreshTokenEntity,
  }) {
    const sessionRegisterer = this.createSessionRegisterer()

    await CustomerAccessToken.beginTransaction(async transaction =>
      sessionRegisterer.revokeSeries({
        sessionKey: refreshTokenEntity.sessionKey,
        now: context.now,
        transaction,
      })
    )
  }

  /**
   * Spend the presented token and issue the next pair of the series.
   *
   * @param {{
   *   context: import('../../../../contexts/CustomerGraphqlContext.js').default
   *   refreshTokenEntity: *
   * }} params - Parameters.
   * @returns {Promise<import('../../../../../../app/auth/SessionRegisterer.js').SessionCredentialPair>}
   * @throws {Error} - Throws error if transaction fails.
   */
  async rotateSession ({
    context,
    refreshTokenEntity,
  }) {
    const transactionCallback = this.generateTransactionCallback({
      refreshTokenEntity,
      now: context.now,
    })

    return CustomerAccessToken.beginTransaction(transactionCallback)
  }

  /**
   * Generate transaction callback.
   *
   * Spending the old row and writing the new pair share one transaction.
   *
   * @param {{
   *   refreshTokenEntity: *
   *   now: Date
   * }} params - Parameters.
   * @returns {function(*): Promise<import('../../../../../../app/auth/SessionRegisterer.js').SessionCredentialPair>}
   */
  generateTransactionCallback ({
    refreshTokenEntity,
    now,
  }) {
    const sessionRegisterer = this.createSessionRegisterer()

    return async transaction => {
      await sessionRegisterer.consumeRefreshToken({
        refreshTokenEntity,
        now,
        transaction,
      })

      return sessionRegisterer.saveTokenPair({
        customerId: refreshTokenEntity.CustomerId,
        sessionKey: refreshTokenEntity.sessionKey,
        now,
        transaction,
      })
    }
  }

  /**
   * Format response.
   *
   * @param {{
   *   credentialPair: import('../../../../../../app/auth/SessionRegisterer.js').SessionCredentialPair
   * }} params - Parameters.
   * @returns {{
   *   accessToken: string
   * }}
   */
  formatResponse ({
    credentialPair: {
      accessToken,
    },
  }) {
    return {
      accessToken,
    }
  }
}
