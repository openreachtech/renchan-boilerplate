'use strict'

const {
  EnvironmentFacade,
} = require('@openreachtech/renchan-env')

const facade = EnvironmentFacade.create()

/** @type {EnvType} */
module.exports = /** @type {*} */ (
  facade.generateFacade()
)

/**
 * @typedef {import('@openreachtech/renchan-env').EnvironmentFacade.EnvironmentFacadeInterface & {
 *   NODE_ENV: string
 *   DATABASE_NAME: string
 *   DATABASE_USERNAME: string
 *   DATABASE_PASSWORD: string
 *   DATABASE_DIALECT: string
 *   DATABASE_HOST: string
 *   DATABASE_PORT: string
 *   AUTH_REFRESH_TOKEN_TTL_DAYS: string
 *   AUTH_COOKIE_SECURE: string
 *   AUTH_COOKIE_SAME_SITE: string
 *   AUTH_COOKIE_PATH: string
 *   AUTH_COOKIE_DOMAIN: string
 * }} EnvType
 */
