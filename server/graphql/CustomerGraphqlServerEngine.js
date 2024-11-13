import {
  UnauthenticatedGraphqlError,
  UnauthorizedGraphqlError,
  DeniedSchemaPermissionGraphqlError,

  BigNumberScalar,
  DateTimeScalar,
} from '@openreachtech/renchan'

import {
  rootPath,
} from '../../app/globals/_.js'

import BaseAppGraphqlServerEngine from './BaseAppGraphqlServerEngine.js'
import CustomerGraphqlShare from './contexts/CustomerGraphqlShare.js'
import CustomerGraphqlContext from './contexts/CustomerGraphqlContext.js'

/**
 * Renchan server engine for customer.
 */
export default class CustomerGraphqlServerEngine extends BaseAppGraphqlServerEngine {
  /** @override */
  static get config () {
    return {
      graphqlEndpoint: '/graphql-customer',
      staticPath: rootPath.to('public/'),
      schemaPath: rootPath.to('server/graphql/schemas/customer.graphql'),
      actualResolversPath: rootPath.to('server/graphql/resolvers/customer/actual/'),
      stubResolversPath: rootPath.to('server/graphql/resolvers/customer/stub/'),

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
      'companySponsors',
      'curriculums',
      'signUp',
      'signIn',

      'createChatRoom',
      'sendChatMessage',
      'chatMessages',
      'chatRooms',

      'onReceiveMessage',
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
    return CustomerGraphqlShare
  }

  /** @override */
  static get Context () {
    return CustomerGraphqlContext
  }

  /** @override */
  async collectScalars () {
    return [
      BigNumberScalar,
      DateTimeScalar,
    ]
  }
}
