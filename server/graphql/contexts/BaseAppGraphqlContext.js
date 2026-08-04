import {
  BaseGraphqlContext,
} from '@openreachtech/renchan'

import cookie from 'cookie'

const SECONDS_PER_DAY = 24 * 60 * 60
const MILLISECONDS_PER_SECOND = 1000

/**
 * Base GraphQL context of this app.
 *
 * Gives the framework context a way to read and write cookies, which is what lets the refresh
 * token live in an `HttpOnly` cookie without moving the auth operations off GraphQL.
 *
 * **All cookie configuration comes from the engine.** Name, lifetime, `Secure` and the rest are
 * read from `this.engine.config`; the path is the engine's `graphqlEndpoint`. This context defines
 * none of them, so configuration is changed in the Engine class alone, never here.
 *
 * **How the response is reachable.** renchan hands a context only `expressRequest`, so the
 * response is not among its properties. But that request is not the express one: the express
 * adapter of `graphql-http` builds it as `{ raw: req, context: { res } }`, so the express
 * response sits at `#get:expressResponse` below. The resolver runs inside the handler, before
 * the handler writes the head, and node merges headers set through `setHeader()` into the ones
 * passed to `writeHead()` — so a cookie written from a resolver reaches the wire.
 *
 * **Reading is not authenticating.** The cookie rides on every request to its endpoint, but only
 * `renewAccessToken` and `signOut` are allowed to treat it as a credential. Every other operation
 * authenticates from the `x-renchan-access-token` header alone, which is what makes a forged
 * cross-site request useless and CSRF structurally impossible.
 *
 * @extends {BaseGraphqlContext}
 */
export default class BaseAppGraphqlContext extends BaseGraphqlContext {
  /**
   * Parse a `Cookie` request header.
   *
   * @param {{
   *   cookieHeader: string | null
   * }} params - Parameters.
   * @returns {Record<string, string> | null} - Parsed cookies, or null when the header is absent.
   */
  static parseCookieHeader ({
    cookieHeader,
  }) {
    if (!cookieHeader) {
      return null
    }

    return cookie.parse(cookieHeader)
  }

  /**
   * get: Own class.
   *
   * @returns {typeof BaseAppGraphqlContext} - Own class.
   */
  get Ctor () {
    return /** @type {typeof BaseAppGraphqlContext} */ (this.constructor)
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

  /**
   * get: Refresh-token cookie config, from the engine.
   *
   * @returns {RefreshTokenCookieConfig} - Cookie config.
   */
  get refreshTokenCookieConfig () {
    return this.engine.config['refreshTokenCookie']
  }

  /**
   * get: Name of the cookie that carries the refresh token.
   *
   * @returns {string} - Cookie name.
   */
  get refreshTokenCookieName () {
    return this.refreshTokenCookieConfig.name
  }

  /**
   * get: Path the refresh token cookie is scoped to.
   *
   * It is the endpoint the engine is mounted at, so the cookie stays off every other route.
   *
   * @returns {string} - Cookie path.
   */
  get refreshTokenCookiePath () {
    return this.engine.config.graphqlEndpoint
  }

  /**
   * get: Lifetime of the refresh token cookie, in milliseconds.
   *
   * @returns {number} - Milliseconds.
   */
  get refreshTokenMaxAgeMilliseconds () {
    return this.refreshTokenCookieConfig.ttlDays
      * SECONDS_PER_DAY
      * MILLISECONDS_PER_SECOND
  }

  /**
   * Extract the refresh token presented by this request.
   *
   * **Calling this is not authenticating.** Only `renewAccessToken` and `signOut` may treat the
   * value as a credential.
   *
   * @returns {string | null} - Refresh token, or null when the cookie is absent.
   */
  extractRefreshToken () {
    return this.Ctor
      .parseCookieHeader({
        cookieHeader: this.cookieHeader,
      })
      ?.[this.refreshTokenCookieName]
      ?? null
  }

  /**
   * Hand a refresh token to the browser as an `HttpOnly` cookie.
   *
   * @param {{
   *   refreshToken: string
   * }} params - Parameters.
   * @returns {void}
   */
  saveRefreshTokenCookie ({
    refreshToken,
  }) {
    this.expressResponse
      ?.cookie(
        this.refreshTokenCookieName,
        refreshToken,
        {
          ...this.generateRefreshTokenCookieOptions(),
          maxAge: this.refreshTokenMaxAgeMilliseconds,
        }
      )
  }

  /**
   * Remove the refresh token cookie from the browser.
   *
   * The options have to match the ones it was written with, or the browser keeps the original
   * cookie and the session appears to survive a sign-out.
   *
   * @returns {void}
   */
  clearRefreshTokenCookie () {
    this.expressResponse
      ?.clearCookie(
        this.refreshTokenCookieName,
        this.generateRefreshTokenCookieOptions()
      )
  }

  /**
   * Build the options of the refresh token cookie.
   *
   * @returns {RefreshTokenCookieOptions} - Cookie options, without a lifetime.
   */
  generateRefreshTokenCookieOptions () {
    const {
      httpOnly,
      secure,
      sameSite,
    } = this.refreshTokenCookieConfig

    return {
      httpOnly,
      secure,
      sameSite,
      path: this.refreshTokenCookiePath,
    }
  }
}

/**
 * @typedef {{
 *   name: string
 *   ttlDays: number
 *   secure: boolean
 *   sameSite: 'lax'
 *   httpOnly: boolean
 * }} RefreshTokenCookieConfig
 */

/**
 * @typedef {{
 *   httpOnly: boolean
 *   secure: boolean
 *   sameSite: 'lax'
 *   path: string
 * }} RefreshTokenCookieOptions
 */
