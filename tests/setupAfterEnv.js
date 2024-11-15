import {
  jest,
} from '@jest/globals'

import {
  ConstructorSpy,
} from '@openreachtech/jest-constructor-spy'

import activate from '../sequelize/_.js'

/*
 * Set global variables.
 */
globalThis.jest = jest
globalThis.constructorSpy = ConstructorSpy.create({
  jest,
})

const activator = await activate()
globalThis.sequelizeActivator = activator

/*
 * Set global hooks.
 */
afterEach(() => {
  jest.restoreAllMocks()
})
