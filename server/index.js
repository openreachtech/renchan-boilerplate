import activate from '../sequelize/_.js'

import {
  GraphqlServerBuilder,
  RestfulApiServerBuilder,
} from '@openreachtech/renchan'

import CustomerGraphqlServerEngine from './graphql/CustomerGraphqlServerEngine.js'
import AdminGraphqlServerEngine from './graphql/AdminGraphqlServerEngine.js'

import AppRestfulApiServerEngine from './restfulapi/AppRestfulApiServerEngine.js'

await activate()

GraphqlServerBuilder.createAsync({
  Engine: CustomerGraphqlServerEngine,
})
  .then(builder =>
    builder.buildHttpServer()
      .listen(3900)
  )

GraphqlServerBuilder.createAsync({
  Engine: AdminGraphqlServerEngine,
})
  .then(builder =>
    builder.buildHttpServer()
      .listen(5800)
  )

RestfulApiServerBuilder.createAsync({
  Engine: AppRestfulApiServerEngine,
})
  .then(builder =>
    builder.buildHttpServer()
      .listen(8001)
  )
