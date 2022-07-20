// @ts-check
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

const CustomerVisaIssuer = require('../graphql/contexts/visa/CustomerVisaIssuer')
const CustomerGraphqlHttpMiddlewareFactory = require('./middleware/CustomerGraphqlHttpMiddlewareFactory')

class CustomerGraphqlRouteComposer extends BaseGraphqlRouteComposer {
  /** @inheritdoc */
  gatekeeperMiddlewareFactory () {
    return VisaIssuerMiddlewareFactory
      .create({ VisaIssuer: CustomerVisaIssuer })
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
    return CustomerGraphqlHttpMiddlewareFactory
      .create()
      .createMiddleware()
  }
}

module.exports = CustomerGraphqlRouteComposer
