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
}

/**
 * @typedef {{
 *   lifetimeDays: number
 *   secure: boolean
 *   sameSite: 'lax'
 *   httpOnly: boolean
 * }} RefreshTokenCookieBaseConfig
 */
