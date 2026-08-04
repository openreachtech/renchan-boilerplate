import cookie from 'cookie'

import ExpressCookieClerk from '../../../../../server/graphql/contexts/ExpressCookieClerk.js'

describe('ExpressCookieClerk', () => {
  describe('constructor', () => {
    describe('to keep properties', () => {
      describe('#context', () => {
        const cases = [
          {
            params: {
              context: /** @type {*} */ ({ label: 'alpha' }),
            },
          },
          {
            params: {
              context: /** @type {*} */ ({ label: 'beta' }),
            },
          },
        ]

        test.each(cases)('context: $params.context.label', ({ params }) => {
          const clerk = new ExpressCookieClerk(params)

          expect(clerk)
            .toHaveProperty('context', params.context)
        })
      })
    })
  })
})

describe('ExpressCookieClerk', () => {
  describe('.create()', () => {
    describe('should be instance of own class', () => {
      const cases = [
        {
          params: {
            context: /** @type {*} */ ({ label: 'alpha' }),
          },
        },
        {
          params: {
            context: /** @type {*} */ ({ label: 'beta' }),
          },
        },
      ]

      test.each(cases)('context: $params.context.label', ({ params }) => {
        const actual = ExpressCookieClerk.create(params)

        expect(actual)
          .toBeInstanceOf(ExpressCookieClerk)
      })
    })

    describe('should be called by constructor', () => {
      const cases = [
        {
          params: {
            context: /** @type {*} */ ({ label: 'alpha' }),
          },
        },
        {
          params: {
            context: /** @type {*} */ ({ label: 'beta' }),
          },
        },
      ]

      test.each(cases)('context: $params.context.label', ({ params }) => {
        const SpyClass = globalThis.constructorSpy.spyOn(ExpressCookieClerk)

        SpyClass.create(params)

        expect(SpyClass.__spy__)
          .toHaveBeenCalledWith(params)
      })
    })
  })
})

describe('ExpressCookieClerk', () => {
  describe('.get:cookieClient', () => {
    test('should be the cookie library', () => {
      const actual = ExpressCookieClerk.cookieClient

      expect(actual)
        .toBe(cookie) // same reference
    })
  })
})

describe('ExpressCookieClerk', () => {
  describe('#parseCookieHeader()', () => {
    describe('should parse the Cookie header into a map', () => {
      const cases = [
        {
          params: {
            cookieHeader: 'test_refresh_token=token-0001',
          },
          expected: {
            test_refresh_token: 'token-0001',
          },
        },
        {
          params: {
            cookieHeader: 'other=1; test_refresh_token=token-0002',
          },
          expected: {
            other: '1',
            test_refresh_token: 'token-0002',
          },
        },
      ]

      test.each(cases)('cookieHeader: $params.cookieHeader', ({ params, expected }) => {
        const clerk = ExpressCookieClerk.create({
          context: /** @type {*} */ ({
            cookieHeader: params.cookieHeader,
          }),
        })

        const actual = clerk.parseCookieHeader()

        expect(actual)
          .toEqual(expected)
      })
    })

    describe('should answer null when the header is absent', () => {
      test('to be null for a missing header', () => {
        const clerk = ExpressCookieClerk.create({
          context: /** @type {*} */ ({
            cookieHeader: null,
          }),
        })

        const actual = clerk.parseCookieHeader()

        expect(actual)
          .toBeNull()
      })
    })
  })
})

describe('ExpressCookieClerk', () => {
  describe('#get:refreshTokenCookieName', () => {
    test('should be the name from the engine config', () => {
      const clerk = ExpressCookieClerk.create({
        context: /** @type {*} */ ({
          config: {
            refreshTokenCookie: {
              name: 'test_refresh_token',
            },
          },
        }),
      })

      const actual = clerk.refreshTokenCookieName

      expect(actual)
        .toBe('test_refresh_token')
    })
  })
})

describe('ExpressCookieClerk', () => {
  describe('#get:refreshTokenCookiePath', () => {
    test('should be the engine graphql endpoint', () => {
      const clerk = ExpressCookieClerk.create({
        context: /** @type {*} */ ({
          config: {
            graphqlEndpoint: '/graphql-test',
          },
        }),
      })

      const actual = clerk.refreshTokenCookiePath

      expect(actual)
        .toBe('/graphql-test')
    })
  })
})

describe('ExpressCookieClerk', () => {
  describe('#get:refreshTokenMaxAgeMilliseconds', () => {
    const cases = [
      {
        params: {
          lifetimeDays: 14,
        },
        expected: 1209600000, // 14 * 24 * 60 * 60 * 1000
      },
      {
        params: {
          lifetimeDays: 7,
        },
        expected: 604800000, // 7 * 24 * 60 * 60 * 1000
      },
    ]

    test.each(cases)('lifetimeDays: $params.lifetimeDays', ({ params, expected }) => {
      const clerk = ExpressCookieClerk.create({
        context: /** @type {*} */ ({
          config: {
            refreshTokenCookie: {
              lifetimeDays: params.lifetimeDays,
            },
          },
        }),
      })

      const actual = clerk.refreshTokenMaxAgeMilliseconds

      expect(actual)
        .toBe(expected)
    })
  })
})

describe('ExpressCookieClerk', () => {
  describe('#generateRefreshTokenCookieOptions()', () => {
    test('should read the options from the engine config and name no Domain', () => {
      // Naming a Domain widens the cookie to every subdomain; every attribute comes from the
      // engine config, so a strict comparison is enough and also proves no Domain is set.
      const clerk = ExpressCookieClerk.create({
        context: /** @type {*} */ ({
          config: {
            graphqlEndpoint: '/graphql-test',
            refreshTokenCookie: {
              name: 'test_refresh_token',
              lifetimeDays: 14,
              secure: true,
              sameSite: 'lax',
              httpOnly: true,
            },
          },
        }),
      })

      const expected = {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/graphql-test',
      }

      const actual = clerk.generateRefreshTokenCookieOptions()

      expect(actual)
        .toEqual(expected)
    })
  })
})

describe('ExpressCookieClerk', () => {
  describe('#extractRefreshToken()', () => {
    describe('should read its own cookie out of the header', () => {
      const cases = [
        {
          params: {
            cookieHeader: 'test_refresh_token=token-0001',
          },
          expected: 'token-0001',
        },
        {
          params: {
            cookieHeader: 'other=1; test_refresh_token=token-0002; another=2',
          },
          expected: 'token-0002',
        },
      ]

      test.each(cases)('cookieHeader: $params.cookieHeader', ({ params, expected }) => {
        const clerk = ExpressCookieClerk.create({
          context: /** @type {*} */ ({
            cookieHeader: params.cookieHeader,
            config: {
              refreshTokenCookie: {
                name: 'test_refresh_token',
              },
            },
          }),
        })

        const actual = clerk.extractRefreshToken()

        expect(actual)
          .toBe(expected)
      })
    })

    describe('should answer null when its own cookie is absent', () => {
      const cases = [
        {
          params: {
            cookieHeader: null,
          },
        },
        {
          params: {
            cookieHeader: 'other=1; another=2',
          },
        },
        {
          params: {
            // A different audience's cookie is not this one.
            cookieHeader: 'admin_refresh_token=token-0003',
          },
        },
      ]

      test.each(cases)('cookieHeader: $params.cookieHeader', ({ params }) => {
        const clerk = ExpressCookieClerk.create({
          context: /** @type {*} */ ({
            cookieHeader: params.cookieHeader,
            config: {
              refreshTokenCookie: {
                name: 'test_refresh_token',
              },
            },
          }),
        })

        const actual = clerk.extractRefreshToken()

        expect(actual)
          .toBeNull()
      })
    })
  })
})

describe('ExpressCookieClerk', () => {
  describe('#saveRefreshTokenCookie()', () => {
    test('should hand the token to the response as an HttpOnly cookie', () => {
      const cookieSpy = jest.fn()

      const clerk = ExpressCookieClerk.create({
        context: /** @type {*} */ ({
          expressResponse: {
            cookie: cookieSpy,
          },
          config: {
            graphqlEndpoint: '/graphql-test',
            refreshTokenCookie: {
              name: 'test_refresh_token',
              lifetimeDays: 14,
              secure: true,
              sameSite: 'lax',
              httpOnly: true,
            },
          },
        }),
      })

      clerk.saveRefreshTokenCookie({
        refreshToken: 'refresh-token-0001',
      })

      expect(cookieSpy)
        .toHaveBeenCalledWith(
          'test_refresh_token',
          'refresh-token-0001',
          {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/graphql-test',
            maxAge: 1209600000,
          }
        )
    })
  })
})

describe('ExpressCookieClerk', () => {
  describe('#clearRefreshTokenCookie()', () => {
    test('should clear the cookie with the same attributes it was written with', () => {
      // The attributes have to match the ones it was written with, or the browser keeps the
      // original cookie and the session appears to survive a sign-out.
      const clearCookieSpy = jest.fn()

      const clerk = ExpressCookieClerk.create({
        context: /** @type {*} */ ({
          expressResponse: {
            clearCookie: clearCookieSpy,
          },
          config: {
            graphqlEndpoint: '/graphql-test',
            refreshTokenCookie: {
              name: 'test_refresh_token',
              lifetimeDays: 14,
              secure: true,
              sameSite: 'lax',
              httpOnly: true,
            },
          },
        }),
      })

      clerk.clearRefreshTokenCookie()

      expect(clearCookieSpy)
        .toHaveBeenCalledWith(
          'test_refresh_token',
          {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/graphql-test',
          }
        )
    })
  })
})
