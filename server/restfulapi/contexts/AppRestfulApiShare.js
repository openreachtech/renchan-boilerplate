import {
  BaseRestfulApiShare,
} from '@openreachtech/renchan'

import AllowedCorsOriginCollection from '../../tools/AllowedCorsOriginCollection.js'

export default class AppRestfulApiShare extends BaseRestfulApiShare {
  /**
   * Constructor.
   *
   * @param {AppRestfulApiShareParams} params - Parameters of this constructor.
   */
  constructor ({
    env,
    allowedCorsOriginCollection,
  }) {
    super({
      env,
    })

    this.allowedCorsOriginCollection = allowedCorsOriginCollection
  }

  /**
   * Factory method.
   *
   * @template {X extends typeof AppRestfulApiShare ? X : never} T, X
   * @param {AppRestfulApiShareFactoryParams} [params] - Parameters of this factory method.
   * @returns {InstanceType<T>} - Instance of this constructor.
   * @this {T}
   */
  static create ({
    env = this.generateEnv(),
    allowedCorsOriginCollection = AllowedCorsOriginCollection.create({
      originsString: null,
    }),
  } = {}) {
    return /** @type {InstanceType<T>} */ (
      new this({
        env,
        allowedCorsOriginCollection,
      })
    )
  }

  /**
   * Create method as async.
   *
   * @template {X extends typeof AppRestfulApiShare ? X : never} T, X
   * @param {AppRestfulApiShareAsyncFactoryParams} params - Parameters of this factory method.
   * @returns {Promise<InstanceType<T>>} - Instance of this constructor.
   * @this {T}
   */
  static async createAsync ({
    config,
  }) {
    const env = this.generateEnv()
    const allowedCorsOriginCollection = this.createAllowedCorsOriginCollection({
      env,
    })

    return this.create({
      env,
      allowedCorsOriginCollection,
    })
  }

  /**
   * Create the collection of the origins `CORS_RESTFUL_API_ORIGINS` declares.
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
      originsString: env.CORS_RESTFUL_API_ORIGINS,
    })
  }
}

/**
 * @typedef {{
 *   env: renchan.RenchanEnv
 *   allowedCorsOriginCollection: AllowedCorsOriginCollection
 * }} AppRestfulApiShareParams
 */

/**
 * @typedef {{
 *   env?: renchan.RenchanEnv
 *   allowedCorsOriginCollection?: AllowedCorsOriginCollection
 * }} AppRestfulApiShareFactoryParams
 */

/**
 * @typedef {{
 *   config: RestfulApiType.Config
 * }} AppRestfulApiShareAsyncFactoryParams
 */
