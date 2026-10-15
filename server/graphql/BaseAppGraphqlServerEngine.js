import {
  BaseGraphqlServerEngine,
} from '@openreachtech/renchan'

import {
  env,
} from '../../app/globals/_.js'

import CorsExpressMiddleware from '../middleware/CorsExpressMiddleware.js'

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

  /** @override */
  static get standardErrorCodeHash () {
    return {
      Unknown: '100.X000.001',
      ConcreteMemberNotFound: '101.X000.001',
      Unauthenticated: '102.X000.001',
      Unauthorized: '102.X000.002',
      DeniedSchemaPermission: '102.X000.003',
      Database: '104.X000.001',

      CanNotSubscribe: '102.S000.001',
    }
  }

  /**
   * get: Express middleware classes the engine composes, in mounting order.
   *
   * @returns {Array<ExpressType.MiddlewareFamilyMemberCtor>} - Middleware classes.
   */
  static get ExpressMiddleware () {
    return [
      CorsExpressMiddleware,
    ]
  }

  /** @override */
  get schemasToSkipFiltering () {
    return [
      'healthCheck',
    ]
  }

  /** @override */
  generateFilterHandler () {
    return async ({
      variables,
      context,
      information,
      parent,
    }) => {
      const schema = information.fieldName

      const canResolve = context.canResolve({
        schema,
      })

      if (canResolve) {
        return
      }

      if (!context.hasAuthenticated()) {
        throw this.errorHash.Unauthenticated.create()
      }

      if (!context.hasAuthorized()) {
        throw this.errorHash.Unauthorized.create()
      }

      if (!context.hasSchemaPermission({
        schema,
      })) {
        throw this.errorHash.DeniedSchemaPermission.create({
          value: {
            schema,
          },
        })
      }
    }
  }

  /** @override */
  get visaIssuers () {
    return {
      hasAuthenticated: async ({
        expressRequest,
        userEntity,
        engine,
      }) => userEntity !== null,
      hasAuthorized: async ({
        expressRequest,
        userEntity,
        engine,
      }) => true,
      generateSchemaPermissionHash: async ({
        expressRequest,
        userEntity,
        engine,
      }) =>
        /**
         * @type {Record<string, boolean> | null} - Schema permission hash. (null means that all schemas have permission)
         * @example
         * ```js
         * return {
         *   customer: true,
         *   statistics: false,
         *   ...
         * }
         * ```
         */ (
          null
        ),
    }
  }

  /** @override */
  async collectScalars () {
    return []
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
