import {
  BaseGraphqlShare,
} from '@openreachtech/renchan'

/**
 * GraphQL shared object for Admin.
 */
export default class AdminGraphqlShare extends BaseGraphqlShare {
  /**
   * Factory method.
   *
   * @template {X extends typeof AdminGraphqlShare ? X : never} T, X
   * @param {AdminGraphqlShareAsyncFactoryParams} params - Parameters of this factory method.
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
}

/**
 * @typedef {Parameters<GraphqlType.ShareCtor['createAsync']>[0]} AdminGraphqlShareAsyncFactoryParams
 */
