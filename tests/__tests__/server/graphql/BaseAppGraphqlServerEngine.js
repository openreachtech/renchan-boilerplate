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
  describe('#collectUploadMiddleware()', () => {
    describe('to mount the upload middleware when the config sets its options', () => {
      const cases = [
        {
          input: {
            config: {
              uploadOptions: {
                maxFileSize: 10000000,
                maxFiles: 10,
              },
            },
          },
        },
        {
          input: {
            config: {
              uploadOptions: {
                maxFileSize: 1000000,
                maxFiles: 1,
              },
            },
          },
        },
      ]

      test.each(cases)('uploadOptions: $input.config.uploadOptions', ({ input }) => {
        const engine = new BaseAppGraphqlServerEngine({
          config: /** @type {*} */ (input.config),
          share: /** @type {*} */ ({}),
          errorHash: {},
        })

        const expected = [
          expect.any(Function),
        ]

        const actual = engine.collectUploadMiddleware()

        expect(actual)
          .toEqual(expected)
      })
    })

    describe('to mount nothing when the config sets no options', () => {
      const cases = [
        {
          input: {
            config: {
              uploadOptions: null,
            },
          },
        },
        {
          input: {
            config: {},
          },
        },
      ]

      test.each(cases)('config: $input.config', ({ input }) => {
        const engine = new BaseAppGraphqlServerEngine({
          config: /** @type {*} */ (input.config),
          share: /** @type {*} */ ({}),
          errorHash: {},
        })

        const actual = engine.collectUploadMiddleware()

        expect(actual)
          .toEqual([])
      })
    })
  })
})
