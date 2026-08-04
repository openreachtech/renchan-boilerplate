import {
  BaseMutationResolver,
} from '@openreachtech/renchan'

import SessionClerk from '../../../../../../app/auth/SessionClerk.js'

import Admin from '../../../../../../sequelize/models/Admin.js'
import AdminAccessToken from '../../../../../../sequelize/models/AdminAccessToken.js'
import AdminRefreshToken from '../../../../../../sequelize/models/AdminRefreshToken.js'
import AdminPasswordHash from '../../../../../../sequelize/models/AdminPasswordHash.js'
import AdminSecret from '../../../../../../sequelize/models/AdminSecret.js'

/**
 * Resolve the signIn mutation of the admin endpoint.
 *
 * The session it issues is a separate token in a separate table, so a customer's credential can
 * never reach a management operation.
 *
 * Issues the pair a session is made of: a short-lived access token, returned in the body, and a
 * refresh token that leaves only as an `HttpOnly` cookie — under the admin cookie name and path,
 * so the browser never even sends the customer's cookie here.
 *
 * @extends {BaseMutationResolver}
 */
export default class SignInMutationResolver extends BaseMutationResolver {
  /** @override */
  static get schema () {
    return 'signIn'
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

      IncorrectSecret: '202.M001.001',
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
   * @returns {SignInMutationResolver} - Instance of this class.
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
   * Resolve the signIn mutation.
   *
   * @override
   * @param {{
   *   variables: {
   *     input: {
   *       email: string
   *       password: string
   *     }
   *   }
   *   context: import('../../../../contexts/AdminGraphqlContext.js').default
   * }} params - Parameters.
   * @returns {Promise<{
   *   accessToken: string
   * }>} - Result of the mutation.
   */
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

    const transactionCallback = this.generateTransactionCallback({
      adminId: passwordHashEntity.AdminId,
      now: context.now,
    })

    const credentialPair = await AdminAccessToken.beginTransaction(transactionCallback)

    // Only after the transaction committed: a cookie for a session that was rolled back would
    // leave the client holding a refresh token no row backs.
    context.saveRefreshTokenCookie({
      refreshToken: credentialPair.refreshToken,
    })

    return this.formatResponse({
      credentialPair,
    })
  }

  /**
   * Generate transaction callback.
   *
   * @param {{
   *   adminId: number
   *   now: Date
   * }} params - Parameters.
   * @returns {(transaction: *) => Promise<import('../../../../../../app/auth/SessionClerk.js').SessionCredentialPair>}
   */
  generateTransactionCallback ({
    adminId,
    now,
  }) {
    return async transaction =>
      this.sessionClerk.issueSession({
        customerId: adminId,
        now,
        transaction,
      })
  }

  /**
   * Find the password hash of the admin holding the given address.
   *
   * A missing address and a wrong password raise the same error, so the answer never tells which
   * of the two it was.
   *
   * @param {{
   *   email: string
   * }} params - Parameters.
   * @returns {Promise<import('../../../../../../sequelize/models/AdminPasswordHash.js').AdminPasswordHashEntity | null>} - Password hash, or null.
   */
  async findPasswordHashByEmail ({
    email,
  }) {
    /**
     * @type {AdminSecret & {
     *   Admin: Admin & {
     *     AdminPasswordHash: AdminPasswordHash
     *   }
     * } | null}
     */
    const adminSecretEntity = /** @type {*} */ (
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

    return /** @type {*} */ (adminSecretEntity.Admin)
      ?.AdminPasswordHash
      ?? null
  }

  /**
   * Format the response for the signIn mutation.
   *
   * **The refresh token is not part of this.** It reaches the client only as a cookie.
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
