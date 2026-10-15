import CorsExpressMiddleware from './CorsExpressMiddleware.js'

/**
 * Express middleware that allows the CORS origins `CORS_CUSTOMER_ORIGINS` declares for the customer endpoint.
 */
export default class CustomerCorsExpressMiddleware extends CorsExpressMiddleware {
  /** @override */
  get originsString () {
    return this.env.CORS_CUSTOMER_ORIGINS
  }
}
