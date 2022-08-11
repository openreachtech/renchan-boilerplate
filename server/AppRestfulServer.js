// @ts-check
'use strict'

const path = require('path')

const {
  BaseRestfulServer,
  RestfulRoutesProducer,
} = require('@openreachtech/renchan').express

class AppRestfulServer extends BaseRestfulServer {
  /** @inheritdoc */
  composeGetRoutes () {
    return RestfulRoutesProducer.create({
      method: 'get',
      path: path.join(__dirname, './express/renderers/get')
    })
      .produceRoutes()
  }

  /** @inheritdoc */
  composePostRoutes () {
    return RestfulRoutesProducer.create({
      method: 'post',
      path: path.join(__dirname, './express/renderers/post')
    })
      .produceRoutes()
  }

  /** @inheritdoc */
  runAsRestfulApi ({
    message = 'Express GraphQL Server Now Running On http://localhost:8001/',
    port = 8001,
  }) {
    super.runAsRestfulApi({
      message,
      port,
    })

    return this
  }
}

module.exports = AppRestfulServer

/**
 * NOTE:
 *
 * End point example.
 * http://localhost:8001/v1/coinpayments/success
 */
