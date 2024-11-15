import activate from '../sequelize/_.js'

import {
  GraphqlServerBuilder,
} from '@openreachtech/renchan'

import CustomerGraphqlServerEngine from './graphql/CustomerGraphqlServerEngine.js'
import AdminGraphqlServerEngine from './graphql/AdminGraphqlServerEngine.js'

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
