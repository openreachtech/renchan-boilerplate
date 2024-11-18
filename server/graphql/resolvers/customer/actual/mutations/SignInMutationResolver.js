import {
  BaseMutationResolver,
} from '@openreachtech/renchan'

import Customer from '../../../../../../sequelize/models/Customer.js'
import CustomerPasswordHash from '../../../../../../sequelize/models/CustomerPasswordHash.js'
import CustomerSecret from '../../../../../../sequelize/models/CustomerSecret.js'
import CustomerAccessToken from '../../../../../../sequelize/models/CustomerAccessToken.js'

export default class SignInMutationResolver extends BaseMutationResolver {
  /** @override */
  static get schema () {
    return 'signIn'
  }

  /** @override */
  async resolve () {
    return {
      accessToken: 'actual-access-token-0001',
      customer: {
        id: 50001,
        name: 'Actual John Doe',
        inviteCode: 'actual0123',
      },
    }
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
   * Save access token.
   *
   * @param {{
   *   context: import('../../../../contexts/CustomerGraphqlContext.js').default
   *   customerId: number
   * }} params - Parameters.
   * @returns {Promise<import('../../../../../../sequelize/models/CustomerAccessToken.js').CustomerAccessTokenEntity>}
   * @throws {Error} - Throws error if transaction fails.
   */
  async saveAccessToken ({
    context,
    customerId,
  }) {
    const callback = this.generateTransactionCallback({
      customerId,
      now: context.now,
    })

    return CustomerAccessToken.beginTransaction(callback)
  }

  /**
   * Generate transaction callback.
   *
   * @param {{
   *   customerId: number
   *   now,
   * }} params
   * @returns {function(): Promise<import('../../../../../../sequelize/models/CustomerAccessToken.js').CustomerAccessTokenEntity>}
   */
  generateTransactionCallback ({
    customerId,
    now,
  }) {
    const accessTokenEntity = CustomerAccessToken.buildWithGeneratedAttributes({
      generatedAt: now,
      customerId,
    })

    return async transaction => /** @type {*} */ (
      accessTokenEntity.save({
        transaction,
      })
    )
  }

  /**
   * Format response.
   *
   * @param {{
   *   accessTokenEntity: import('../../../../../../sequelize/models/CustomerAccessToken.js').CustomerAccessTokenEntity
   * }} params - Parameters.
   * @returns {{
   *   accessToken: string
   * }}
   */
  formatResponse ({
    accessTokenEntity: {
      accessToken,
    },
  }) {
    return {
      accessToken,
    }
  }
}
