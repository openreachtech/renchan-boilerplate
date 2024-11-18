import {
  BaseMutationResolver,
} from '@openreachtech/renchan'

import Customer from '../../../../../../sequelize/models/Customer.js'
import CustomerPasswordHash from '../../../../../../sequelize/models/CustomerPasswordHash.js'
import CustomerSecret from '../../../../../../sequelize/models/CustomerSecret.js'

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
}
