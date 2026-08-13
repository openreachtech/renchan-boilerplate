import {
  BaseMutationResolver,
} from '@openreachtech/renchan'

import SessionClerk from '../../../../../../app/session/SessionClerk.js'
import RefreshTokenExpressCookieClerk from '../../../../contexts/tools/RefreshTokenExpressCookieClerk.js'

import Admin from '../../../../../../sequelize/models/Admin.js'
import AdminPasswordHash from '../../../../../../sequelize/models/AdminPasswordHash.js'
import AdminSecret from '../../../../../../sequelize/models/AdminSecret.js'
import AdminAccessToken from '../../../../../../sequelize/models/AdminAccessToken.js'
import AdminRefreshToken from '../../../../../../sequelize/models/AdminRefreshToken.js'

/**
 * Resolve the admin signIn mutation.
 *
 * Issues the session pair: the access token in the response body, the refresh token only as an
 * `HttpOnly` cookie — never in the body, so no page script can read it. The cookie name and path
 * come from the admin engine config, so the browser never sends it to the customer endpoint.
 *
 * @extends {BaseMutationResolver}
 */
export default class SignInMutationResolver extends BaseMutationResolver {
  /** @override */
  static get schema () {
    return 'signIn'
  }

  /** @override */
  static get errorCodeHash () {
    return {
      ...super.errorCodeHash,

      IncorrectSecret: '202.M004.001',
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

  /** @override */
  async resolve ({
    variables: {
      input: {
        email,
        password,
      },
    },
    context,
  }) {
    const passwordHashEntity = await this.findPasswordHashByEmail({
      email,
    })

    if (!passwordHashEntity) {
      throw this.errorHash.IncorrectSecret.create()
    }

    const isValidPassword = await passwordHashEntity.verifiesPassword({
      password,
    })

    if (!isValidPassword) {
      throw this.errorHash.IncorrectSecret.create()
    }

    const sessionClerk = this.createSessionClerk()

    const result = await sessionClerk.saveSession({
      userId: passwordHashEntity.AdminId,
      now: context.now,
    })

    if (result.hasError()) {
      throw new Error(result.extractErrorMessage())
    }

    // Only after the transaction committed: a cookie for a session that was rolled back would
    // leave the client holding a refresh token no row backs.
    const cookieClerk = this.createCookieClerk({
      context,
    })

    cookieClerk.saveRefreshTokenCookie({
      refreshToken: result.credentialPair.refreshToken,
    })

    return this.formatResponse({
      credentialPair: result.credentialPair,
    })
  }

  /**
   * Find password hash by email.
   *
   * @param {{
   *   email: string
   * }} params - Parameters.
   * @returns {Promise<AdminPasswordHashEntity | null>}
   */
  async findPasswordHashByEmail ({
    email,
  }) {
    const adminSecretEntity = /** @type {AdminSecretWithPasswordHash} */ (
      await AdminSecret.findOne({
        where: {
          email,
        },
        include: [
          {
            model: Admin,
            include: [
              AdminPasswordHash,
            ],
          },
        ],
      })
    )

    if (!adminSecretEntity) {
      return null
    }

    const {
      Admin: {
        AdminPasswordHash: passwordHashEntity,
      },
    } = adminSecretEntity

    return /** @type {AdminPasswordHashEntity} */ (passwordHashEntity)
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
   * Format response.
   *
   * @param {{
   *   credentialPair: import('../../../../../../app/session/SessionClerk.js').SessionCredentialPair
   * }} params - Parameters.
   * @returns {{
   *   accessToken: string
   * }}
   */
  formatResponse ({
    credentialPair: {
      accessTokenEntity,
    },
  }) {
    return {
      accessToken: accessTokenEntity.accessToken,
    }
  }
}

/**
 * @typedef {(AdminSecret & {
 *   Admin: Admin & {
 *     AdminPasswordHash: AdminPasswordHash
 *   }
 * }) | null} AdminSecretWithPasswordHash
 */

/**
 * @typedef {import('../../../../../../sequelize/models/AdminPasswordHash.js').AdminPasswordHashEntity} AdminPasswordHashEntity
 */
