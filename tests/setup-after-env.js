import {
  jest as jestCore,
} from '@jest/globals'

import {
  ConstructorSpy,
} from '@openreachtech/jest-constructor-spy'

import {
  setupExpectEach,
} from '@openreachtech/jest-expect-each'

import activate from '../sequelize/_.js'

setupExpectEach()

/*
 * Set global variables.
 */
globalThis.jest = jestCore
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
