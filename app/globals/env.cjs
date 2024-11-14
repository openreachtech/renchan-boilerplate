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
 * }} EnvType
 */

/**
 * FIXME:
 * When remove function parameter type like `isDevelopment: () => boolean`, facade object will show type error.
 * We need to fix the type in @openreachtech/renchan-env.
 */
