import {
  BaseMutationResolver,
} from '@openreachtech/renchan'

import SessionClerk from '../../../../../../app/auth/SessionClerk.js'

import Customer from '../../../../../../sequelize/models/Customer.js'
import CustomerPasswordHash from '../../../../../../sequelize/models/CustomerPasswordHash.js'
import CustomerSecret from '../../../../../../sequelize/models/CustomerSecret.js'
import CustomerAccessToken from '../../../../../../sequelize/models/CustomerAccessToken.js'
import CustomerRefreshToken from '../../../../../../sequelize/models/CustomerRefreshToken.js'

/**
 * Resolve the signIn mutation.
 *
 * Issues the pair a session is made of: a short-lived access token, returned in the body for the
 * client to hold in memory, and a refresh token that leaves only as an `HttpOnly` cookie. **The
 * refresh token is never in the response body** — putting it there would hand it to any script on
 * the page, which is the exact exposure the cookie exists to close.
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

      IncorrectSecret: '202.M002.001',
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
   * Create session clerk bound to the customer tables.
   *
   * @returns {SessionClerk} - Session clerk.
   */
  static createSessionClerk () {
    return SessionClerk.create({
      AccessTokenModel: CustomerAccessToken,
      RefreshTokenModel: CustomerRefreshToken,
    })
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

    const credentialPair = await this.saveSession({
      context,
      customerId: passwordHashEntity.CustomerId,
    })

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
   * Find password customer by email.
   *
   * @param {{
   *   email: string
   * }} params
   * @returns {Promise<import('../../../../../../sequelize/models/CustomerPasswordHash.js').CustomerPasswordHashEntity | null>}
   */
  async findPasswordHashByEmail ({
    email,
  }) {
    /**
     * @type {CustomerSecret & {
     *   Customer: Customer & {
     *     CustomerPasswordHash: CustomerPasswordHash
     *   }
     * } | null}
     */
    const customerSecretEntity = /** @type {*} */ (
      await CustomerSecret.findOne({
        where: {
          email,
        },
        include: [
          {
            model: Customer,
            include: [
              CustomerPasswordHash,
            ],
          },
        ],
      })
    )

    if (!customerSecretEntity) {
      return null
    }

    const {
      Customer: {
        CustomerPasswordHash: passwordHashEntity,
      },
    } = customerSecretEntity

    return /** @type {*} */ (passwordHashEntity)
  }

  /**
   * Save a new session.
   *
   * @param {{
   *   context: import('../../../../contexts/CustomerGraphqlContext.js').default
   *   customerId: number
   * }} params - Parameters.
   * @returns {Promise<import('../../../../../../app/auth/SessionClerk.js').SessionCredentialPair>}
   * @throws {Error} - Throws error if transaction fails.
   */
  async saveSession ({
    context,
    customerId,
  }) {
    const transactionCallback = this.generateTransactionCallback({
      customerId,
      now: context.now,
    })

    return CustomerAccessToken.beginTransaction(transactionCallback)
  }

  /**
   * Generate transaction callback.
   *
   * @param {{
   *   customerId: number
   *   now: Date
   * }} params - Parameters.
   * @returns {function(*): Promise<import('../../../../../../app/auth/SessionClerk.js').SessionCredentialPair>}
   */
  generateTransactionCallback ({
    customerId,
    now,
  }) {
    return async transaction =>
      this.sessionClerk.issueSession({
        customerId,
        now,
        transaction,
      })
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
