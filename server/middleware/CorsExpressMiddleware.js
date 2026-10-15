import cors from 'cors'

import {
  BaseExpressMiddleware,
} from '@openreachtech/renchan'

import AllowedCorsOriginCollection from '../tools/AllowedCorsOriginCollection.js'

/**
 * Express middleware that allows the CORS origins a derived class reads from the environment.
 *
 * @extends {BaseExpressMiddleware<import('../graphql/BaseAppGraphqlServerEngine.js').default | import('../restfulapi/AppRestfulApiServerEngine.js').default>}
 */
export default class CorsExpressMiddleware extends BaseExpressMiddleware {
  /**
   * get: CORS library.
   *
   * @returns {typeof cors} - The `cors` library.
   */
  static get corsClient () {
    return cors
  }

  /** @override */
  get Ctor () {
    return /** @type {typeof CorsExpressMiddleware} */ (this.constructor)
  }

  /**
   * get: Environment of the share.
   *
   * @returns {renchan.RenchanEnv} - Environment.
   */
  get env () {
    return this.share.env
  }

  /**
   * get: Allowed CORS origins as one comma-separated string.
   *
   * @abstract
   * @returns {string | null} - Comma-separated origins.
   * @throws {Error} - When a derived class does not override it.
   */
  get originsString () {
    throw new Error(`101.X000.001 {"memberName":"${this.constructor.name}#get:originsString"}`)
  }

  /** @override */
  composeMiddleware () {
    return this.Ctor.corsClient(this.buildOptionHash())
  }

  /**
   * Create the collection of the allowed CORS origins.
   *
   * @returns {AllowedCorsOriginCollection} - Allowed origins.
   */
  createAllowedCorsOriginCollection () {
    return AllowedCorsOriginCollection.create({
      originsString: this.originsString,
    })
  }

  /**
   * Build the options of the `cors` library.
   *
   * @returns {import('cors').CorsOptions} - Options.
   */
  buildOptionHash () {
    return {
      origin: this.createAllowedCorsOriginCollection()
        .extractOrigins(),
    }
  }
}
