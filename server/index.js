import activate from '../sequelize/_.js'

import {
  GraphqlServerBuilder,
  RestfulApiServerBuilder,
} from '@openreachtech/renchan'

import CustomerGraphqlServerEngine from './graphql/CustomerGraphqlServerEngine.js'
import AdminGraphqlServerEngine from './graphql/AdminGraphqlServerEngine.js'

import AppRestfulApiServerEngine from './restfulapi/AppRestfulApiServerEngine.js'

/*
 * Bind to loopback only: the app servers sit behind a reverse proxy (see docs/reverse-proxy), so
 * they must not accept connections from other network interfaces.
 */
const LOOPBACK_HOST = '127.0.0.1'

await activate()

GraphqlServerBuilder.createAsync({
  Engine: CustomerGraphqlServerEngine,
})
  .then(builder =>
    builder.buildHttpServer()
      .listen(3900, LOOPBACK_HOST)
  )

GraphqlServerBuilder.createAsync({
  Engine: AdminGraphqlServerEngine,
})
  .then(builder =>
    builder.buildHttpServer()
      .listen(5800, LOOPBACK_HOST)
  )

RestfulApiServerBuilder.createAsync({
  Engine: AppRestfulApiServerEngine,
})
  .then(builder =>
    builder.buildHttpServer()
      .listen(8001, LOOPBACK_HOST)
  )
