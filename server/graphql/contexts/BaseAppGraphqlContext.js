import {
  BaseGraphqlContext,
} from '@openreachtech/renchan'

import cookie from 'cookie'

import {
  env,
} from '../../../app/globals/_.js'

const DEFAULT_REFRESH_TOKEN_TTL_DAYS = 14
const SECONDS_PER_DAY = 24 * 60 * 60

/**
 * Base GraphQL context of this app.
 *
 * Gives the framework context a way to read and write cookies, which is what lets the refresh
 * token live in an `HttpOnly` cookie without moving the auth operations off GraphQL.
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
 * @abstract
 * @extends {BaseGraphqlContext}
 */
export default class BaseAppGraphqlContext extends BaseGraphqlContext {
  /**
   * get: Name of the cookie that carries the refresh token.
   *
   * @abstract
   * @returns {string} - Cookie name.
   * @throws {Error} - This feature must be inherited.
   */
  static get REFRESH_TOKEN_COOKIE_NAME () {
    throw new Error(`${this.name}.get:REFRESH_TOKEN_COOKIE_NAME must be inherited`)
  }

  /**
   * get: Path the refresh token cookie is scoped to.
   *
   * @abstract
   * @returns {string} - Cookie path.
   * @throws {Error} - This feature must be inherited.
   */
  static get REFRESH_TOKEN_COOKIE_PATH () {
    throw new Error(`${this.name}.get:REFRESH_TOKEN_COOKIE_PATH must be inherited`)
  }

  /**
   * get: Lifetime of the refresh token cookie, in seconds.
   *
   * @returns {number} - Seconds.
   */
  static get refreshTokenMaxAge () {
    return this.refreshTokenTtlDays * SECONDS_PER_DAY
  }

  /**
   * get: Lifetime of the refresh token, in days.
   *
   * @returns {number} - Days.
   */
  static get refreshTokenTtlDays () {
    return Number(env.AUTH_REFRESH_TOKEN_TTL_DAYS)
      || DEFAULT_REFRESH_TOKEN_TTL_DAYS
  }

  /**
   * get: Whether the refresh token cookie carries `Secure`.
   *
   * Only an explicit `false` turns it off, so a missing or misspelled variable keeps the safe
   * value. Turning it off is for plain-HTTP verification hosts alone; over HTTPS a `Secure`
   * cookie is the whole point.
   *
   * @returns {boolean} - true: emit `Secure`.
   */
  static get usesSecureCookie () {
    return env.AUTH_COOKIE_SECURE !== 'false'
  }

  /**
   * Build the options of the refresh token cookie.
   *
   * @returns {{
   *   httpOnly: boolean
   *   secure: boolean
   *   sameSite: 'lax'
   *   path: string
   * }} - Cookie options, without a lifetime.
   */
  static generateRefreshTokenCookieOptions () {
    return {
      httpOnly: true,
      secure: this.usesSecureCookie,
      sameSite: 'lax',
      path: this.REFRESH_TOKEN_COOKIE_PATH,
    }
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
      ?.[this.Ctor.REFRESH_TOKEN_COOKIE_NAME]
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
        this.Ctor.REFRESH_TOKEN_COOKIE_NAME,
        refreshToken,
        {
          ...this.Ctor.generateRefreshTokenCookieOptions(),
          maxAge: this.Ctor.refreshTokenMaxAge * 1000,
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
        this.Ctor.REFRESH_TOKEN_COOKIE_NAME,
        this.Ctor.generateRefreshTokenCookieOptions()
      )
  }
}
