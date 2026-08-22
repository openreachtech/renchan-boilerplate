import express from 'express'
import cors from 'cors'

import {
  graphqlUploadExpressWithResolvingContentType,
} from '@openreachtech/renchan'

import {
  rootPath,
} from '../../app/globals/_.js'

import AUTH_CONSTANT_HASH from '../../app/constants/authConstants.js'

import BaseAppGraphqlServerEngine from './BaseAppGraphqlServerEngine.js'

import AdminGraphqlShare from './contexts/AdminGraphqlShare.js'
import AdminGraphqlContext from './contexts/AdminGraphqlContext.js'

const {
  REFRESH_TOKEN_COOKIE,
} = AUTH_CONSTANT_HASH

/**
 * Renchan server engine for admin.
 */
export default class AdminGraphqlServerEngine extends BaseAppGraphqlServerEngine {
  /** @override */
  static get config () {
    return {
      graphqlEndpoint: '/graphql-admin',
      refreshTokenCookie: this.buildRefreshTokenCookieConfig(),
      staticPath: rootPath.to('public/'),
      schemaPath: rootPath.to('server/graphql/schemas/admin.graphql'),
      actualResolversPath: rootPath.to('server/graphql/resolvers/admin/actual/'),
      stubResolversPath: rootPath.to('server/graphql/resolvers/admin/stub/'),
      postWorkersPath: null,

      /*
       * NOTE: Uncomment the following line to enable Redis PubSub
       *   When disabled, LocalPubSub is used.
       */
      redisOptions: null,
      // redisOptions: {
      //   host: 'localhost',
      //   port: 6379,
      // },
    }
  }

  /**
   * Build the refresh-token cookie config for this audience.
   *
   * @returns {import('./contexts/tools/RefreshTokenExpressCookieClerk.js').RefreshTokenCookieConfig} - Cookie config.
   */
  static buildRefreshTokenCookieConfig () {
    return {
      ...this.refreshTokenCookieConfig,
      name: REFRESH_TOKEN_COOKIE.ADMIN.NAME,
    }
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

  /** @override */
  collectMiddleware () {
    return [
      cors({
        origin: '*',
      }),

      express.json({
        limit: '10mb',
      }),

      express.static(
        this.config.staticPath
      ),

      graphqlUploadExpressWithResolvingContentType({
        maxFileSize: 10000000, // 10 MB
        maxFiles: 10,
      }),

      express.urlencoded({
        extended: true,
        verify: (req, res, body) => {
          // eslint-disable-next-line no-param-reassign
          req['rawBody'] = body.toString()
        },
      }),
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
  static get Share () {
    return AdminGraphqlShare
  }

  /** @override */
  static get Context () {
    return AdminGraphqlContext
  }

  /** @override */
  async collectScalars () {
    return []
  }
}
