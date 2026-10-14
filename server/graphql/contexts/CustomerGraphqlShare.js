import {
  BaseGraphqlShare,
} from '@openreachtech/renchan'

import AllowedCorsOriginCollection from '../../tools/AllowedCorsOriginCollection.js'

/**
 * GraphQL shared object for Customer.
 */
export default class CustomerGraphqlShare extends BaseGraphqlShare {
  /**
   * Constructor.
   *
   * @param {CustomerGraphqlShareParams} params - Parameters of this constructor.
   */
  constructor ({
    env,
    broker,
    allowedCorsOriginCollection,
  }) {
    super({
      env,
      broker,
    })

    this.allowedCorsOriginCollection = allowedCorsOriginCollection
  }

  /**
   * Factory method.
   *
   * @template {X extends typeof CustomerGraphqlShare ? X : never} T, X
   * @param {CustomerGraphqlShareFactoryParams} params - Parameters of this factory method.
   * @returns {InstanceType<T>} - Instance of this constructor.
   * @this {T}
   */
  static create ({
    env = this.generateEnv(),
    broker = null,
    allowedCorsOriginCollection = AllowedCorsOriginCollection.create({
      originsString: null,
    }),
  }) {
    return /** @type {InstanceType<T>} */ (
      new this({
        env,
        broker,
        allowedCorsOriginCollection,
      })
    )
  }

  /**
   * Factory method.
   *
   * @template {X extends typeof CustomerGraphqlShare ? X : never} T, X
   * @param {CustomerGraphqlShareAsyncFactoryParams} params - Parameters of this factory method.
   * @returns {Promise<InstanceType<T>>} - Instance of this constructor.
   * @this {T}
   */
  static async createAsync ({
    config,
  }) {
    const env = this.generateEnv()
    const broker = this.createBroker({
      config,
    })
    const allowedCorsOriginCollection = this.createAllowedCorsOriginCollection({
      env,
    })

    return this.create({
      env,
      broker,
      allowedCorsOriginCollection,
    })
  }

  /**
   * Create the collection of the origins `CORS_CUSTOMER_ORIGINS` declares.
   *
   * @param {{
   *   env: renchan.RenchanEnv
   * }} params - Parameters of this method.
   * @returns {AllowedCorsOriginCollection} - Collection of the allowed CORS origins.
   */
  static createAllowedCorsOriginCollection ({
    env,
  }) {
    return AllowedCorsOriginCollection.create({
      originsString: env.CORS_CUSTOMER_ORIGINS,
    })
  }
}

/**
 * @typedef {{
 *   env: renchan.RenchanEnv
 *   broker?: GraphqlType.SubscriptionBroker | null
 *   allowedCorsOriginCollection: AllowedCorsOriginCollection
 * }} CustomerGraphqlShareParams
 */

/**
 * @typedef {{
 *   env?: renchan.RenchanEnv
 *   broker?: GraphqlType.SubscriptionBroker | null
 *   allowedCorsOriginCollection?: AllowedCorsOriginCollection
 * }} CustomerGraphqlShareFactoryParams
 */

/**
 * @typedef {Parameters<GraphqlType.ShareCtor['createAsync']>[0]} CustomerGraphqlShareAsyncFactoryParams
 */
