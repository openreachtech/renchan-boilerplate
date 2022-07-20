// @ts-check
'use strict'

const {
  express: {
    BaseRouteComposer,
    middleware: {
      CorsMiddlewareFactory,
      ExpressJsonMiddlewareFactory,
      ExpressStaticMiddlewareFactory,
    }
  }
} = require('@openreachtech/renchan')

class AppRootRouteComposer extends BaseRouteComposer {
  /** @inheritdoc */
  fulfillMiddleware () {
    return [
      CorsMiddlewareFactory.create().createMiddleware(),
      ExpressJsonMiddlewareFactory.create().createMiddleware(),
      ExpressStaticMiddlewareFactory.create().createMiddleware('../../app/public'),
    ]
  }
}

module.exports = AppRootRouteComposer
