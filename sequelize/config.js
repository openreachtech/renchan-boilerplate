// @ts-check
'use strict'

module.exports = {
  development: {
    database: 'development_database',
    username: null,
    password: null,

    dialect: 'sqlite',
    storage: 'sequelize/storage/development.sqlite3',
    logging: false,
  },
  live: {
    username: 'root',
    password: 'password',
    database: 'live',
    host: '127.0.0.1',

    dialect: 'mariadb',
    port: '3306'
  },
  staging: {
    database: 'staging_database',
    username: 'admin-staging',
    password: 'staging-password',

    dialect: 'mysql',
    host: 'http://staging.sample.openreach.tech',
    port: 3306,
  },
  production: {
    database: 'production_database',
    username: 'admin-production',
    password: 'production-password',

    dialect: 'mysql',
    host: 'http://pruduction.sample.openreach.tech',
    port: 3306,
  }
}
