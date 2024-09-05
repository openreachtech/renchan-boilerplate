'use strict'

const {
  express: {
    BaseExpressServer,
  }
} = require('@openreachtech/renchan')

const AppRootRouteComposer = require('./express/AppRootRouteComposer')
const AdminGraphqlRouteComposer = require('./express/AdminGraphqlRouteComposer')

class AdminExpressServer extends BaseExpressServer {
  /** @inheritdoc */
  composeRoutes () {
    return [
      AppRootRouteComposer.create().createRoute(),
      AdminGraphqlRouteComposer.create().createRoute({ path: '/graphql-admin' }),
    ]
  }

  /**
   * Run an express server as admin.
   *
   * @param {*} config - Listen config to run server.
   * @returns {AdminExpressServer} - For method chain.
   */
  runAsAdmin ({
    message = 'Express GraphQL Server Now Running On http://localhost:6300/graphql-admin',
    port = 6300,
  } = {}) {
    this.run({
      port,
      message,
    })

    return this
  }
}

module.exports = AdminExpressServer
