import {
  SequelizeActivator,
} from '@openreachtech/renchan-sequelize'

import {
  env,
  rootPath,
} from '../app/globals/_.js'

export default async () =>
  SequelizeActivator
    .createAsync({
      nodeEnv: env.NODE_ENV,
      configPath: rootPath.to('sequelize/config.cjs'),
      modelsPath: rootPath.to('sequelize/models/'),
    })
