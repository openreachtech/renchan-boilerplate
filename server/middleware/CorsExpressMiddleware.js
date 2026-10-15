import cors from 'cors'

import {
  BaseExpressMiddleware,
} from '@openreachtech/renchan'

/**
 * Express middleware that allows the CORS origins the share declares.
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
   * get: Collection of the allowed CORS origins, from the share.
   *
   * @returns {import('../tools/AllowedCorsOriginCollection.js').default} - Allowed origins.
   */
  get allowedCorsOriginCollection () {
    return this.share.allowedCorsOriginCollection
  }

  /** @override */
  composeMiddleware () {
    return this.Ctor.corsClient(this.buildOptionHash())
  }

  /**
   * Build the options of the `cors` library.
   *
   * @returns {import('cors').CorsOptions} - Options.
   */
  buildOptionHash () {
    return {
      origin: this.allowedCorsOriginCollection.extractOrigins(),
    }
  }
}
