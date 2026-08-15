import {
  BaseRestfulApiServerEngine,
} from '@openreachtech/renchan'

import AppRestfulApiServerEngine from '../../../../server/restfulapi/AppRestfulApiServerEngine.js'

describe('AppRestfulApiServerEngine', () => {
  describe('super class', () => {
    test('to be instance of base class', () => {
      const actual = AppRestfulApiServerEngine.prototype

      expect(actual)
        .toBeInstanceOf(BaseRestfulApiServerEngine)
    })
  })
})

describe('AppRestfulApiServerEngine', () => {
  describe('.get:corsAllowedOrigins', () => {
    describe('to be an empty allowlist when the env value is unset', () => {
      test('should have no origins', () => {
        const actual = AppRestfulApiServerEngine.corsAllowedOrigins

        expect(actual)
          .toHaveLength(0)
      })
    })
  })
})

describe('AppRestfulApiServerEngine', () => {
  describe('.buildCorsOptions()', () => {
    describe('to allow credentials with the allowlisted origins', () => {
      test('should be the default cors options', () => {
        const expected = {
          origin: [],
          credentials: true,
        }

        const actual = AppRestfulApiServerEngine.buildCorsOptions()

        expect(actual)
          .toEqual(expected)
      })
    })
  })
})
