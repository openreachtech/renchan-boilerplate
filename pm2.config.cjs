'use strict'

const ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
}

module.exports = {
  apps: [
    {
      name: 'GraphQL API',
      script: './server/index.js',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      env_development: {
        NODE_ENV: ENV.DEVELOPMENT,
      },
      env_production: {
        NODE_ENV: ENV.PRODUCTION,
      },
    },
  ],
}
