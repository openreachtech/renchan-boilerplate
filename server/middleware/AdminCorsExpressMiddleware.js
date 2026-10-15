import CorsExpressMiddleware from './CorsExpressMiddleware.js'

/**
 * Express middleware that allows the CORS origins `CORS_ADMIN_ORIGINS` declares for the admin endpoint.
 */
export default class AdminCorsExpressMiddleware extends CorsExpressMiddleware {
  /** @override */
  get originsString () {
    return this.env.CORS_ADMIN_ORIGINS
  }
}
