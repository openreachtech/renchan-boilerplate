import AUTH_CONSTANT_HASH from '../../../app/constants/authConstants.js'

import Customer from '../../../sequelize/models/Customer.js'
import CustomerBasic from '../../../sequelize/models/CustomerBasic.js'
import CustomerAccessToken from '../../../sequelize/models/CustomerAccessToken.js'

import BaseAppGraphqlContext from './BaseAppGraphqlContext.js'

const {
  REFRESH_TOKEN_COOKIE,
} = AUTH_CONSTANT_HASH

/**
 * Customer GraphQL context.
 *
 * @extends {BaseAppGraphqlContext}
 */
export default class CustomerGraphqlContext extends BaseAppGraphqlContext {
  /**
   * get: Name of the cookie that carries the refresh token.
   *
   * @override
   * @returns {string} - Cookie name.
   */
  static get REFRESH_TOKEN_COOKIE_NAME () {
    return REFRESH_TOKEN_COOKIE.CUSTOMER.NAME
  }

  /**
   * get: Path the refresh token cookie is scoped to.
   *
   * @override
   * @returns {string} - Cookie path.
   */
  static get REFRESH_TOKEN_COOKIE_PATH () {
    return REFRESH_TOKEN_COOKIE.CUSTOMER.PATH
  }

  /**
   * Find user.
   *
   * @param {{
   *   expressRequest: ExpressType.Request
   *   accessToken: string | null
   *   requestedAt: Date
   * }} params
   * @returns {Promise<renchan.UserEntity | null>} - User entity.
   * @example
   * ```js
   * static async findUser ({ expressRequest, accessToken }) {
   *   const entity = CustomerAccessToken.findOne({
   *     where: {
   *       accessToken,
   *     },
   *     include: [
   *        Customer,
   *     ],
   *   })
   *
   *   if (!entity) {
   *     return null
   *   }
   *
   *   return entity
   * }
   * ```
   */
  static async findUser ({
    expressRequest,
    accessToken,
    requestedAt,
  }) {
    const customerAccessTokenEntity = await this.findCustomerAccessToken({
      accessToken,
    })

    if (!customerAccessTokenEntity) {
      return null
    }

    if (customerAccessTokenEntity.isExpired({
      pointsAt: requestedAt,
    })) {
      return null
    }

    return customerAccessTokenEntity.Customer
      ?? null
  }

  /**
   * Find customer access token.
   *
   * @param {{
   *   accessToken: string
   * }} params - Parameters.
   * @returns {Promise<import('../../../sequelize/models/CustomerAccessToken').CustomerAccessTokenAssociatedEntity | null>} - Customer access token.
   */
  static async findCustomerAccessToken ({
    accessToken,
  }) {
    /** @type {import('../../../sequelize/models/CustomerAccessToken').CustomerAccessTokenAssociatedEntity | null} */
    const customerAccessTokenEntity = /** @type {*} */ (
      await CustomerAccessToken.findOne({
        where: {
          accessToken,
        },
        include: [
          {
            model: Customer,
            include: [
              CustomerBasic,
            ],
          },
        ],
      })
    )

    return customerAccessTokenEntity
      ?? null
  }

  /**
   * get: Customer entity.
   * Note: This is an alias of #userEntity
   *
   * @returns {renchan.UserEntity | null} - Customer entity.
   * @example
   * ```js
   * async resolve ({ variables, context }) {
   *   const customerEntity = context.customer
   * }
   * ```
   */
  get customer () {
    return this.userEntity
  }

  /**
   * get: Customer id.
   *
   * @returns {number | null} - Customer id.
   * @example
   * ```js
   * async resolve ({ variables, context }) {
   *   const id = context.customerId
   * }
   * ```
   */
  get customerId () {
    return this.userId
  }
}
