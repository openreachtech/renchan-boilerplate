import {
  BaseMutationResolver,
} from '@openreachtech/renchan'

import SessionRegisterer from '../../../../../../app/auth/SessionRegisterer.js'
import RefreshTokenExpressCookieClerk from '../../../../contexts/tools/RefreshTokenExpressCookieClerk.js'

import Customer from '../../../../../../sequelize/models/Customer.js'
import CustomerPasswordHash from '../../../../../../sequelize/models/CustomerPasswordHash.js'
import CustomerSecret from '../../../../../../sequelize/models/CustomerSecret.js'
import CustomerAccessToken from '../../../../../../sequelize/models/CustomerAccessToken.js'
import CustomerRefreshToken from '../../../../../../sequelize/models/CustomerRefreshToken.js'

/**
 * Resolve the signIn mutation.
 *
 * Issues the session pair: the access token in the response body, the refresh token only as an
 * `HttpOnly` cookie — never in the body, so no page script can read it.
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
   * get: RefreshTokenExpressCookieClerk class — a seam so tests can substitute it.
   *
   * @returns {typeof RefreshTokenExpressCookieClerk} - The class.
   */
  get RefreshTokenExpressCookieClerkCtor () {
    return RefreshTokenExpressCookieClerk
  }

  /**
   * get: SessionRegisterer class — a seam so tests can substitute it.
   *
   * @returns {typeof SessionRegisterer} - The class.
   */
  get SessionRegistererCtor () {
    return SessionRegisterer
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
    const cookieClerk = this.createCookieClerk({
      context,
    })

    cookieClerk.saveRefreshTokenCookie({
      refreshToken: credentialPair.refreshToken,
    })

    return this.formatResponse({
      credentialPair,
    })
  }

  /**
   * Find password hash by email.
   *
   * @param {{
   *   email: string
   * }} params - Parameters.
   * @returns {Promise<CustomerPasswordHashEntity | null>}
   */
  async findPasswordHashByEmail ({
    email,
  }) {
    const customerSecretEntity = /** @type {CustomerSecretWithPasswordHash} */ (
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

    return /** @type {CustomerPasswordHashEntity} */ (passwordHashEntity)
  }

  /**
   * Save a new session.
   *
   * @param {{
   *   context: import('../../../../contexts/CustomerGraphqlContext.js').default
   *   customerId: number
   * }} params - Parameters.
   * @returns {Promise<import('../../../../../../app/auth/SessionRegisterer.js').SessionCredentialPair>}
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
   * @returns {function(Transaction): Promise<import('../../../../../../app/auth/SessionRegisterer.js').SessionCredentialPair>}
   */
  generateTransactionCallback ({
    customerId,
    now,
  }) {
    const sessionRegisterer = this.createSessionRegisterer()

    return async transaction =>
      sessionRegisterer.saveSession({
        customerId,
        now,
        transaction,
      })
  }

  /**
   * Create session registerer bound to the customer tables.
   *
   * @returns {SessionRegisterer} - Session registerer.
   */
  createSessionRegisterer () {
    return this.SessionRegistererCtor.create({
      AccessTokenModel: CustomerAccessToken,
      RefreshTokenModel: CustomerRefreshToken,
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
    return this.RefreshTokenExpressCookieClerkCtor.create({
      context,
    })
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
      accessTokenEntity,
    },
  }) {
    return {
      accessToken: accessTokenEntity.accessToken,
    }
  }
}

/**
 * @typedef {import('sequelize').Transaction} Transaction
 */

/**
 * @typedef {(CustomerSecret & {
 *   Customer: Customer & {
 *     CustomerPasswordHash: CustomerPasswordHash
 *   }
 * }) | null} CustomerSecretWithPasswordHash
 */

/**
 * @typedef {import('../../../../../../sequelize/models/CustomerPasswordHash.js').CustomerPasswordHashEntity} CustomerPasswordHashEntity
 */
