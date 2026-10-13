import {
  BaseGraphqlShare,
} from '@openreachtech/renchan'

import AllowedOriginsParser from '../../tools/AllowedOriginsParser.js'

/**
 * GraphQL shared object for Customer.
 */
export default class CustomerGraphqlShare extends BaseGraphqlShare {
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
    const broker = this.createBroker({
      config,
    })

    return this.create({
      env: this.generateEnv(),
      broker,
    })
  }

  /**
   * Generate the origins a browser may call the engine from.
   *
   * @returns {Array<string>} - Allowed origins, none when `CORS_CUSTOMER_ORIGINS` declares none.
   */
  generateAllowedOrigins () {
    return AllowedOriginsParser.create({
      originsText: this.env.CORS_CUSTOMER_ORIGINS,
    })
      .parseOrigins()
  }
}

/**
 * @typedef {Parameters<GraphqlType.ShareCtor['createAsync']>[0]} CustomerGraphqlShareAsyncFactoryParams
 */
