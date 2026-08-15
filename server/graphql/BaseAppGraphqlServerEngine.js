import {
  BaseGraphqlServerEngine,
} from '@openreachtech/renchan'

import {
  env,
} from '../../app/globals/_.js'

const DEFAULT_REFRESH_TOKEN_LIFETIME_DAYS = 14

/**
 * Base GraphQL server engine of this app.
 *
 * The single place to change refresh-token cookie configuration. Each concrete engine composes its
 * own `config.refreshTokenCookie` from `refreshTokenCookieConfig` here, adding only its
 * audience-specific cookie name — so a maintainer changes these defaults in one Engine class,
 * never in a Context.
 *
 * @extends {BaseGraphqlServerEngine}
 */
export default class BaseAppGraphqlServerEngine extends BaseGraphqlServerEngine {
  /**
   * get: Browser origins allowed to send credentialed requests.
   *
   * Parsed from the comma-separated `CORS_ALLOWED_ORIGINS`. A missing or empty variable yields an
   * empty allowlist, which blocks every cross-origin browser request — the safe default.
   *
   * @returns {Array<string>} - Allowlisted origins.
   */
  static get corsAllowedOrigins () {
    return (env.CORS_ALLOWED_ORIGINS ?? '')
      .split(',')
      .map(origin => origin.trim())
      .filter(origin => origin !== '')
  }

  /**
   * get: Shared refresh-token cookie configuration.
   *
   * @returns {RefreshTokenCookieBaseConfig} - Shared config; the name is added per audience.
   */
  static get refreshTokenCookieConfig () {
    return {
      lifetimeDays: this.refreshTokenCookieLifetimeDays,
      secure: this.usesSecureRefreshTokenCookie,
      sameSite: 'lax',
      httpOnly: true,
    }
  }

  /**
   * get: Lifetime of the refresh token, in days.
   *
   * @returns {number} - Days.
   */
  static get refreshTokenCookieLifetimeDays () {
    const normalizedDays = Number(env.AUTH_REFRESH_TOKEN_TTL_DAYS)

    if (!normalizedDays) {
      return DEFAULT_REFRESH_TOKEN_LIFETIME_DAYS
    }

    return normalizedDays
  }

  /**
   * get: Whether the refresh token cookie carries `Secure`.
   *
   * Only an explicit `false` turns it off, so a missing or misspelled variable keeps the safe
   * value. Turning it off is for plain-HTTP verification hosts alone.
   *
   * @returns {boolean} - true: emit `Secure`.
   */
  static get usesSecureRefreshTokenCookie () {
    return env.AUTH_COOKIE_SECURE !== 'false'
  }

  /**
   * Build CORS options that reflect only the allowlisted origins and allow credentials.
   *
   * `credentials: true` lets the browser send the refresh-token cookie, and it cannot combine with
   * a `*` origin — so the origin is the explicit allowlist, never a wildcard.
   *
   * @returns {CorsOptions} - CORS options.
   */
  static buildCorsOptions () {
    return {
      origin: this.corsAllowedOrigins,
      credentials: true,
    }
  }
}

/**
 * @typedef {{
 *   lifetimeDays: number
 *   secure: boolean
 *   sameSite: 'lax'
 *   httpOnly: boolean
 * }} RefreshTokenCookieBaseConfig
 */

/**
 * @typedef {{
 *   origin: Array<string>
 *   credentials: boolean
 * }} CorsOptions
 */
