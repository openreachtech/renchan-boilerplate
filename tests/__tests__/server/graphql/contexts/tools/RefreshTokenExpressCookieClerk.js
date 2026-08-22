import cookie from 'cookie'

import RefreshTokenExpressCookieClerk from '../../../../../../server/graphql/contexts/tools/RefreshTokenExpressCookieClerk.js'

describe('RefreshTokenExpressCookieClerk', () => {
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
          const clerk = new RefreshTokenExpressCookieClerk(params)

          expect(clerk)
            .toHaveProperty('context', params.context)
        })
      })
    })
  })
})

describe('RefreshTokenExpressCookieClerk', () => {
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
        const actual = RefreshTokenExpressCookieClerk.create(params)

        expect(actual)
          .toBeInstanceOf(RefreshTokenExpressCookieClerk)
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
        const SpyClass = globalThis.constructorSpy.spyOn(RefreshTokenExpressCookieClerk)

        SpyClass.create(params)

        expect(SpyClass.__spy__)
          .toHaveBeenCalledWith(params)
      })
    })
  })
})

describe('RefreshTokenExpressCookieClerk', () => {
  describe('.get:cookieClient', () => {
    describe('to be the cookie library', () => {
      test('should be the cookie module', () => {
        const actual = RefreshTokenExpressCookieClerk.cookieClient

        expect(actual)
          .toBe(cookie) // same reference
      })
    })
  })
})

describe('RefreshTokenExpressCookieClerk', () => {
  describe('#get:refreshTokenCookieName', () => {
    describe('to be the name from the engine config', () => {
      const cases = [
        {
          params: {
            name: 'customer_refresh_token',
          },
          expected: 'customer_refresh_token',
        },
        {
          params: {
            name: 'admin_refresh_token',
          },
          expected: 'admin_refresh_token',
        },
      ]

      test.each(cases)('name: $params.name', ({ params, expected }) => {
        const clerk = RefreshTokenExpressCookieClerk.create({
          context: /** @type {*} */ ({
            config: {
              refreshTokenCookie: {
                name: params.name,
              },
            },
          }),
        })

        const actual = clerk.refreshTokenCookieName

        expect(actual)
          .toBe(expected)
      })
    })
  })
})

describe('RefreshTokenExpressCookieClerk', () => {
  describe('#get:refreshTokenCookiePath', () => {
    describe('to be the engine graphql endpoint', () => {
      const cases = [
        {
          params: {
            graphqlEndpoint: '/graphql-customer',
          },
          expected: '/graphql-customer',
        },
        {
          params: {
            graphqlEndpoint: '/graphql-admin',
          },
          expected: '/graphql-admin',
        },
      ]

      test.each(cases)('graphqlEndpoint: $params.graphqlEndpoint', ({ params, expected }) => {
        const clerk = RefreshTokenExpressCookieClerk.create({
          context: /** @type {*} */ ({
            config: {
              graphqlEndpoint: params.graphqlEndpoint,
            },
          }),
        })

        const actual = clerk.refreshTokenCookiePath

        expect(actual)
          .toBe(expected)
      })
    })
  })
})

describe('RefreshTokenExpressCookieClerk', () => {
  describe('#get:refreshTokenMaxAgeMilliseconds', () => {
    describe('to be the lifetime rendered in milliseconds', () => {
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
        const clerk = RefreshTokenExpressCookieClerk.create({
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
})

describe('RefreshTokenExpressCookieClerk', () => {
  describe('#buildRefreshTokenCookieOptionHash()', () => {
    describe('to carry the attributes plus the lifetime rendered as maxAge', () => {
      const cases = [
        {
          params: {
            config: {
              graphqlEndpoint: '/graphql-customer',
              refreshTokenCookie: {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                lifetimeDays: 14,
              },
            },
          },
          expected: {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/graphql-customer',
            maxAge: 1209600000, // 14 * 24 * 60 * 60 * 1000
          },
        },
        {
          params: {
            config: {
              graphqlEndpoint: '/graphql-admin',
              refreshTokenCookie: {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                lifetimeDays: 7,
              },
            },
          },
          expected: {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/graphql-admin',
            maxAge: 604800000, // 7 * 24 * 60 * 60 * 1000
          },
        },
      ]

      test.each(cases)('config: $params.config.graphqlEndpoint', ({ params, expected }) => {
        const clerk = RefreshTokenExpressCookieClerk.create({
          context: /** @type {*} */ ({
            config: params.config,
          }),
        })

        const actual = clerk.buildRefreshTokenCookieOptionHash()

        expect(actual)
          .toEqual(expected)
      })
    })
  })
})

describe('RefreshTokenExpressCookieClerk', () => {
  describe('#buildRefreshTokenCookieAttributeHash()', () => {
    describe('to read every attribute from the engine config, without a lifetime', () => {
      // `secure` and the path come from the config, so varying them proves nothing is hardcoded;
      // no `domain` and no `maxAge` are ever set, which the strict comparison also confirms.
      const cases = [
        {
          params: {
            config: {
              graphqlEndpoint: '/graphql-customer',
              refreshTokenCookie: {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
              },
            },
          },
          expected: {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/graphql-customer',
          },
        },
        {
          params: {
            config: {
              graphqlEndpoint: '/graphql-admin',
              refreshTokenCookie: {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
              },
            },
          },
          expected: {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/graphql-admin',
          },
        },
      ]

      test.each(cases)('config: $params.config.graphqlEndpoint', ({ params, expected }) => {
        const clerk = RefreshTokenExpressCookieClerk.create({
          context: /** @type {*} */ ({
            config: params.config,
          }),
        })

        const actual = clerk.buildRefreshTokenCookieAttributeHash()

        expect(actual)
          .toEqual(expected)
      })
    })
  })
})

describe('RefreshTokenExpressCookieClerk', () => {
  describe('#parseCookieHeader()', () => {
    describe('to parse the Cookie header into a map', () => {
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
        const clerk = RefreshTokenExpressCookieClerk.create({
          context: /** @type {*} */ ({
            cookieHeader: params.cookieHeader,
          }),
        })

        const actual = clerk.parseCookieHeader()

        expect(actual)
          .toEqual(expected)
      })
    })

    describe('to be null when the header is absent', () => {
      const cases = [
        {
          params: {
            cookieHeader: null,
          },
        },
      ]

      test.each(cases)('cookieHeader: $params.cookieHeader', ({ params }) => {
        const clerk = RefreshTokenExpressCookieClerk.create({
          context: /** @type {*} */ ({
            cookieHeader: params.cookieHeader,
          }),
        })

        const actual = clerk.parseCookieHeader()

        expect(actual)
          .toBeNull()
      })
    })
  })
})

describe('RefreshTokenExpressCookieClerk', () => {
  describe('#extractRefreshToken()', () => {
    describe('to read its own cookie out of the header', () => {
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
        const clerk = RefreshTokenExpressCookieClerk.create({
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

    describe('to be null when its own cookie is absent', () => {
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
        const clerk = RefreshTokenExpressCookieClerk.create({
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

describe('RefreshTokenExpressCookieClerk', () => {
  describe('#saveRefreshTokenCookie()', () => {
    describe('to write the token as an HttpOnly cookie', () => {
      const cases = [
        {
          params: {
            refreshToken: 'refresh-token-0001',
          },
        },
        {
          params: {
            refreshToken: 'refresh-token-0002',
          },
        },
      ]

      test.each(cases)('refreshToken: $params.refreshToken', ({ params }) => {
        const cookieSpy = jest.fn()

        const clerk = RefreshTokenExpressCookieClerk.create({
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
          refreshToken: params.refreshToken,
        })

        expect(cookieSpy)
          .toHaveBeenCalledWith(
            'test_refresh_token',
            params.refreshToken,
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
})

describe('RefreshTokenExpressCookieClerk', () => {
  describe('#clearRefreshTokenCookie()', () => {
    describe('to clear the cookie with the same attributes it was written with', () => {
      test('should call clearCookie with the matching options', () => {
        // The attributes have to match the ones it was written with, or the browser keeps the
        // original cookie and the session appears to survive a sign-out.
        const clearCookieSpy = jest.fn()

        const clerk = RefreshTokenExpressCookieClerk.create({
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
})
