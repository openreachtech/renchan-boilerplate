import {
  BaseGraphqlContext,
} from '@openreachtech/renchan'

/**
 * Base GraphQL context of this app.
 *
 * A plain DTO. It exposes the request/response and the engine config that a resolver — or a
 * `RefreshTokenExpressCookieClerk` built from it — needs, and carries no logic of its own. The
 * refresh-token cookie is handled by `RefreshTokenExpressCookieClerk`, not here.
 *
 * **How the response is reachable.** renchan hands a context only `expressRequest`, so the
 * response is not among its properties. But that request is not the express one: the express
 * adapter of `graphql-http` builds it as `{ raw: req, context: { res } }`, so the express
 * response sits at `#get:expressResponse` below. The resolver runs inside the handler, before
 * the handler writes the head, and node merges headers set through `setHeader()` into the ones
 * passed to `writeHead()` — so a cookie written from a resolver reaches the wire.
 *
 * @extends {BaseGraphqlContext}
 */
export default class BaseAppGraphqlContext extends BaseGraphqlContext {
  /**
   * get: Engine config.
   *
   * @returns {AppGraphqlConfig} - Engine config, including this app's `refreshTokenCookie`.
   */
  get config () {
    return /** @type {AppGraphqlConfig} */ (this.engine.config)
  }

  /**
   * get: `Cookie` header of this request.
   *
   * @returns {string | null} - Header value, or null when absent.
   */
  get cookieHeader () {
    return this.expressRequest
      ?.headers
      ?.cookie
      ?? null
  }

  /**
   * get: Express response of this request.
   *
   * See the class description for why this is reachable at all.
   *
   * @returns {ExpressType.Response | null} - Express response, or null outside an HTTP request.
   */
  get expressResponse () {
    return this.expressRequest
      ?.['context']
      ?.res
      ?? null
  }
}

/**
 * @typedef {GraphqlType.Config & {
 *   refreshTokenCookie: import('./tools/RefreshTokenExpressCookieClerk.js').RefreshTokenCookieConfig
 * }} AppGraphqlConfig
 */
