import BaseAppGraphqlServerEngine from '../../../../server/graphql/BaseAppGraphqlServerEngine.js'

describe('BaseAppGraphqlServerEngine', () => {
  describe('.get:refreshTokenCookieLifetimeDays', () => {
    test('to fall back to fourteen days when unset', () => {
      const actual = BaseAppGraphqlServerEngine.refreshTokenCookieLifetimeDays

      expect(actual)
        .toBe(14)
    })
  })
})

describe('BaseAppGraphqlServerEngine', () => {
  describe('.get:usesSecureRefreshTokenCookie', () => {
    test('to be true when unset', () => {
      const actual = BaseAppGraphqlServerEngine.usesSecureRefreshTokenCookie

      expect(actual)
        .toBeTruthy()
    })
  })
})

describe('BaseAppGraphqlServerEngine', () => {
  describe('.get:refreshTokenCookieConfig', () => {
    test('to carry the shared cookie attributes', () => {
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
