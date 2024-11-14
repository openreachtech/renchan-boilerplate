import {
  UnauthenticatedGraphqlError,
  UnauthorizedGraphqlError,
  DeniedSchemaPermissionGraphqlError,

  DateTimeScalar,
} from '@openreachtech/renchan'

import {
  rootPath,
} from '../../app/globals/_.js'

import BaseAppGraphqlServerEngine from './BaseAppGraphqlServerEngine.js'
import AdminGraphqlShare from './contexts/AdminGraphqlShare.js'
import AdminGraphqlContext from './contexts/AdminGraphqlContext.js'

/**
 * Renchan server engine for admin.
 */
export default class AdminGraphqlServerEngine extends BaseAppGraphqlServerEngine {
  /** @override */
  static get config () {
    return {
      graphqlEndpoint: '/graphql-admin',
      staticPath: rootPath.to('public/'),
      schemaPath: rootPath.to('server/graphql/schemas/admin.graphql'),
      actualResolversPath: rootPath.to('server/graphql/resolvers/admin/actual/'),
      stubResolversPath: rootPath.to('server/graphql/resolvers/admin/stub/'),

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

  /** @override */
  get schemasToSkipFiltering () {
    return [
      'signUp',
      'signIn',
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
        throw UnauthenticatedGraphqlError.create()
      }

      if (!context.hasAuthorized()) {
        throw UnauthorizedGraphqlError.create()
      }

      if (!context.hasSchemaPermission({
        schema,
      })) {
        throw DeniedSchemaPermissionGraphqlError.create()
          .withValueHash({
            schema,
          })
      }
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
    return [
      DateTimeScalar,
    ]
  }
}
