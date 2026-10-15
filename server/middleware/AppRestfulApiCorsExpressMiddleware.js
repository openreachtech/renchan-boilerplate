import CorsExpressMiddleware from './CorsExpressMiddleware.js'

/**
 * Express middleware that allows the CORS origins `CORS_RESTFUL_API_ORIGINS` declares for the RESTful API endpoint.
 */
export default class AppRestfulApiCorsExpressMiddleware extends CorsExpressMiddleware {
  /** @override */
  get originsString () {
    return this.env.CORS_RESTFUL_API_ORIGINS
  }
}
