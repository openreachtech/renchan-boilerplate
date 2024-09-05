'use strict'

const {
  express: {
    BaseGraphqlRouteComposer,
    middleware: {
      GraphqlUploadExpressMiddlewareFactory,
      VisaIssuerMiddlewareFactory,
    }
  }
} = require('@openreachtech/renchan')

const AdminVisaIssuer = require('../graphql/contexts/visa/AdminVisaIssuer')
const AdminGraphqlHttpMiddlewareFactory = require('./middleware/AdminGraphqlHttpMiddlewareFactory')

class AdminGraphqlRouteComposer extends BaseGraphqlRouteComposer {
  /** @inheritdoc */
  gatekeeperMiddlewareFactory () {
    return VisaIssuerMiddlewareFactory
      .create({ VisaIssuer: AdminVisaIssuer })
      .createMiddleware()
  }

  /** @inheritdoc */
  composePreGraphqlHttpMiddleware () {
    return [
      GraphqlUploadExpressMiddlewareFactory
        .create()
        .createMiddleware()
    ]
  }

  /** @inheritdoc */
  graphqlHttpMiddlewareFactory () {
    return AdminGraphqlHttpMiddlewareFactory
      .create()
      .createMiddleware()
  }
}

module.exports = AdminGraphqlRouteComposer
