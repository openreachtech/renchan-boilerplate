import {
  BaseMutationResolver,
} from '@openreachtech/renchan'

import SessionClerk from '../../../../../../app/auth/SessionClerk.js'

import AdminAccessToken from '../../../../../../sequelize/models/AdminAccessToken.js'
import AdminRefreshToken from '../../../../../../sequelize/models/AdminRefreshToken.js'

/**
 * Resolve the renewAccessToken mutation of the admin endpoint.
 *
 * The counterpart of the customer endpoint's renewAccessToken, running the same protocol over the
 * admin tables and the admin cookie.
 *
 * **Authenticates from the refresh cookie, not from the header.** By the time this is called the
 * access token has usually expired — that is the whole reason it is called — so requiring one
 * would make the operation unreachable exactly when it is needed. It is therefore listed in
 * `schemasToSkipFiltering`, and the cookie is the credential.
 *
 * **The token rotates on every use.** The presented row is marked spent and a new pair is issued
 * into the same series. That is what makes a leak detectable: a stolen cookie and the real client
 * cannot both keep renewing, because whichever presents the spent value second reveals that two
 * parties hold it. There is no way to tell which of the two is the thief, so the series is revoked
 * whole and both are sent back to the sign-in screen.
 *
 * @extends {BaseMutationResolver}
 */
export default class RenewAccessTokenMutationResolver extends BaseMutationResolver {
  /** @override */
  static get schema () {
    return 'renewAccessToken'
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

      // Raised here rather than by the engine's filter: this operation skips filtering, so
      // nothing upstream is left to answer for a missing credential. The `102` category is what
      // tells the client to sign in again.
      Unauthenticated: '102.M002.001',

      RefreshTokenReused: '205.M002.001',
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
   * @returns {RenewAccessTokenMutationResolver} - Instance of this class.
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
   * Resolve the renewAccessToken mutation.
   *
   * @override
   * @param {{
   *   context: import('../../../../contexts/AdminGraphqlContext.js').default
   * }} params - Parameters.
   * @returns {Promise<{
   *   accessToken: string
   * }>} - The renewed access token.
   * @throws {Error} - Unauthenticated, or the refresh token was reused.
   */
  async resolve ({
    context,
  }) {
    const refreshTokenEntity = await this.sessionClerk.findRefreshTokenEntity({
      presentedRefreshToken: context.extractRefreshToken(),
    })

    if (!refreshTokenEntity) {
      context.clearRefreshTokenCookie()

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
      context.clearRefreshTokenCookie()

      throw this.errorHash.Unauthenticated.create()
    }

    const credentialPair = await this.rotateSession({
      context,
      refreshTokenEntity,
    })

    context.saveRefreshTokenCookie({
      refreshToken: credentialPair.refreshToken,
    })

    return this.formatResponse({
      credentialPair,
    })
  }

  /**
   * Handle a reused refresh token: revoke its whole series, clear the cookie, and report the
   * reuse. Kept out of the `if` body so no `await` sits inside the branch.
   *
   * @param {{
   *   context: import('../../../../contexts/AdminGraphqlContext.js').default
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

    context.clearRefreshTokenCookie()

    throw this.errorHash.RefreshTokenReused.create()
  }

  /**
   * Revoke the series a reused token belongs to.
   *
   * @param {{
   *   context: import('../../../../contexts/AdminGraphqlContext.js').default
   *   refreshTokenEntity: *
   * }} params - Parameters.
   * @returns {Promise<void>}
   */
  async revokeReusedSeries ({
    context,
    refreshTokenEntity,
  }) {
    await AdminAccessToken.beginTransaction(async transaction =>
      this.sessionClerk.revokeSeries({
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
   *   context: import('../../../../contexts/AdminGraphqlContext.js').default
   *   refreshTokenEntity: *
   * }} params - Parameters.
   * @returns {Promise<import('../../../../../../app/auth/SessionClerk.js').SessionCredentialPair>}
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

    return AdminAccessToken.beginTransaction(transactionCallback)
  }

  /**
   * Generate transaction callback.
   *
   * Marking the old row spent and writing the new pair belong to one transaction: half of this
   * would leave the client holding a refresh token the server does not honour.
   *
   * @param {{
   *   refreshTokenEntity: *
   *   now: Date
   * }} params - Parameters.
   * @returns {function(*): Promise<import('../../../../../../app/auth/SessionClerk.js').SessionCredentialPair>}
   */
  generateTransactionCallback ({
    refreshTokenEntity,
    now,
  }) {
    return async transaction => {
      await this.sessionClerk.consumeRefreshToken({
        refreshTokenEntity,
        now,
        transaction,
      })

      return this.sessionClerk.issueTokens({
        customerId: refreshTokenEntity.AdminId,
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
   *   credentialPair: import('../../../../../../app/auth/SessionClerk.js').SessionCredentialPair
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
