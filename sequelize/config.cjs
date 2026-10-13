'use strict'

const env = require('../app/globals/env.cjs')

/**
 * Build the development entry, on SQLite until `DATABASE_DIALECT` names another dialect.
 *
 * @returns {object} - Development entry.
 */
function buildDevelopmentConfig () {
  if (
    !env.DATABASE_DIALECT
    || env.DATABASE_DIALECT === 'sqlite'
  ) {
    return {
      database: 'development_database',
      username: null,
      password: null,

      dialect: 'sqlite',
      storage: 'sequelize/storage/development.sqlite3',
      logging: false,
    }
  }

  return {
    database: env.DATABASE_NAME,
    username: env.DATABASE_USERNAME,
    password: env.DATABASE_PASSWORD,

    dialect: env.DATABASE_DIALECT,
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    logging: false,
  }
}

module.exports = {
  development: buildDevelopmentConfig(),
  live: {
    username: 'root',
    password: 'password',
    database: 'live',
    host: '127.0.0.1',

    dialect: 'mariadb',
    port: '3306',
  },
  staging: {
    database: env.DATABASE_NAME,
    username: env.DATABASE_USERNAME,
    password: env.DATABASE_PASSWORD,

    dialect: env.DATABASE_DIALECT,
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
  },
  production: {
    database: env.DATABASE_NAME,
    username: env.DATABASE_USERNAME,
    password: env.DATABASE_PASSWORD,

    dialect: env.DATABASE_DIALECT,
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
  },
}
