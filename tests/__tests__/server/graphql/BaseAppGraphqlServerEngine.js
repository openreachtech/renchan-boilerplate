import {
  BaseGraphqlServerEngine,
} from '@openreachtech/renchan'

import BaseAppGraphqlServerEngine from '../../../../server/graphql/BaseAppGraphqlServerEngine.js'

describe('BaseAppGraphqlServerEngine', () => {
  describe('super class', () => {
    test('to be instance of base class', () => {
      const actual = BaseAppGraphqlServerEngine.prototype

      expect(actual)
        .toBeInstanceOf(BaseGraphqlServerEngine)
    })
  })
})

describe('BaseAppGraphqlServerEngine', () => {
  describe('.get:refreshTokenCookieLifetimeDays', () => {
    describe('to fall back to the default when the env value is unset', () => {
      test('should be fourteen days', () => {
        const actual = BaseAppGraphqlServerEngine.refreshTokenCookieLifetimeDays

        expect(actual)
          .toBe(14)
      })
    })
  })
})

describe('BaseAppGraphqlServerEngine', () => {
  describe('.get:usesSecureRefreshTokenCookie', () => {
    describe('to keep the secure flag on when the env value is unset', () => {
      test('should be truthy', () => {
        const actual = BaseAppGraphqlServerEngine.usesSecureRefreshTokenCookie

        expect(actual)
          .toBeTruthy()
      })
    })
  })
})

describe('BaseAppGraphqlServerEngine', () => {
  describe('.get:refreshTokenCookieConfig', () => {
    describe('to carry the shared cookie attributes', () => {
      test('should be the default config', () => {
        const expected = {
          lifetimeDays: 14,
          secure: true,
          sameSite: 'lax',
          httpOnly: true,
        }

        const actual = BaseAppGraphqlServerEngine.refreshTokenCookieConfig

        expect(actual)
          .toEqual(expected)
      })
    })
  })
})

describe('BaseAppGraphqlServerEngine', () => {
  describe('.get:corsAllowedOrigins', () => {
    describe('to be an empty allowlist when the env value is unset', () => {
      test('should have no origins', () => {
        const actual = BaseAppGraphqlServerEngine.corsAllowedOrigins

        expect(actual)
          .toHaveLength(0)
      })
    })
  })
})

describe('BaseAppGraphqlServerEngine', () => {
  describe('.buildCorsOptions()', () => {
    describe('to allow credentials with the allowlisted origins', () => {
      test('should be the default cors options', () => {
        const expected = {
          origin: [],
          credentials: true,
        }

        const actual = BaseAppGraphqlServerEngine.buildCorsOptions()

        expect(actual)
          .toEqual(expected)
      })
    })
  })
})
