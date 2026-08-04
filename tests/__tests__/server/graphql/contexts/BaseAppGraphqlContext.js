import BaseAppGraphqlContext from '../../../../../server/graphql/contexts/BaseAppGraphqlContext.js'

describe('BaseAppGraphqlContext', () => {
  describe('#get:refreshTokenCookiePath', () => {
    test('should be the engine graphql endpoint', () => {
      const context = BaseAppGraphqlContext.create(/** @type {*} */ ({
        expressRequest: {},
        requestParams: {},
        engine: {
          config: {
            graphqlEndpoint: '/graphql-test',
            refreshTokenCookie: {
              name: 'test_refresh_token',
              ttlDays: 14,
              secure: true,
              sameSite: 'lax',
              httpOnly: true,
            },
          },
        },
        userEntity: null,
        visa: {},
      }))

      const actual = context.refreshTokenCookiePath

      expect(actual)
        .toBe('/graphql-test')
    })
  })
})

describe('BaseAppGraphqlContext', () => {
  describe('#get:refreshTokenMaxAgeMilliseconds', () => {
    const cases = [
      {
        params: {
          ttlDays: 14,
        },
        expected: 14 * 24 * 60 * 60 * 1000,
      },
      {
        params: {
          ttlDays: 7,
        },
        expected: 7 * 24 * 60 * 60 * 1000,
      },
    ]

    test.each(cases)('ttlDays: $params.ttlDays', ({ params, expected }) => {
      const context = BaseAppGraphqlContext.create(/** @type {*} */ ({
        expressRequest: {},
        requestParams: {},
        engine: {
          config: {
            graphqlEndpoint: '/graphql-test',
            refreshTokenCookie: {
              name: 'test_refresh_token',
              ttlDays: params.ttlDays,
              secure: true,
              sameSite: 'lax',
              httpOnly: true,
            },
          },
        },
        userEntity: null,
        visa: {},
      }))

      const actual = context.refreshTokenMaxAgeMilliseconds

      expect(actual)
        .toBe(expected)
    })
  })
})

describe('BaseAppGraphqlContext', () => {
  describe('#generateRefreshTokenCookieOptions()', () => {
    test('should read the options from the engine config and name no Domain', () => {
      // Naming a Domain widens the cookie to every subdomain; every attribute comes from the
      // engine config, so a strict comparison is enough and also proves no Domain is set.
      const context = BaseAppGraphqlContext.create(/** @type {*} */ ({
        expressRequest: {},
        requestParams: {},
        engine: {
          config: {
            graphqlEndpoint: '/graphql-test',
            refreshTokenCookie: {
              name: 'test_refresh_token',
              ttlDays: 14,
              secure: true,
              sameSite: 'lax',
              httpOnly: true,
            },
          },
        },
        userEntity: null,
        visa: {},
      }))

      const expected = {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/graphql-test',
      }

      const actual = context.generateRefreshTokenCookieOptions()

      expect(actual)
        .toEqual(expected)
    })
  })
})

describe('BaseAppGraphqlContext', () => {
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
        const context = BaseAppGraphqlContext.create(/** @type {*} */ ({
          expressRequest: {
            headers: {
              cookie: params.cookieHeader,
            },
          },
          requestParams: {},
          engine: {
            config: {
              graphqlEndpoint: '/graphql-test',
              refreshTokenCookie: {
                name: 'test_refresh_token',
                ttlDays: 14,
                secure: true,
                sameSite: 'lax',
                httpOnly: true,
              },
            },
          },
          userEntity: null,
          visa: {},
        }))

        const actual = context.extractRefreshToken()

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
        const context = BaseAppGraphqlContext.create(/** @type {*} */ ({
          expressRequest: {
            headers: {
              cookie: params.cookieHeader,
            },
          },
          requestParams: {},
          engine: {
            config: {
              graphqlEndpoint: '/graphql-test',
              refreshTokenCookie: {
                name: 'test_refresh_token',
                ttlDays: 14,
                secure: true,
                sameSite: 'lax',
                httpOnly: true,
              },
            },
          },
          userEntity: null,
          visa: {},
        }))

        const actual = context.extractRefreshToken()

        expect(actual)
          .toBeNull()
      })
    })
  })
})

describe('BaseAppGraphqlContext', () => {
  describe('#get:expressResponse', () => {
    describe('should reach the express response through the graphql-http request', () => {
      test('to be the response carried at request.context.res', () => {
        // renchan hands a context only the request. The express adapter of graphql-http builds
        // that request as { raw, context: { res } }, which is the only route to the response.
        const expressResponse = /** @type {*} */ ({ marker: 'response' })

        const context = BaseAppGraphqlContext.create(/** @type {*} */ ({
          expressRequest: {
            context: {
              res: expressResponse,
            },
          },
          requestParams: {},
          engine: {
            config: {},
          },
          userEntity: null,
          visa: {},
        }))

        const actual = context.expressResponse

        expect(actual)
          .toBe(expressResponse) // same reference
      })
    })

    describe('should answer null outside an HTTP request', () => {
      test('to be null when the request carries no response', () => {
        const context = BaseAppGraphqlContext.create(/** @type {*} */ ({
          expressRequest: {},
          requestParams: {},
          engine: {
            config: {},
          },
          userEntity: null,
          visa: {},
        }))

        const actual = context.expressResponse

        expect(actual)
          .toBeNull()
      })
    })
  })
})

describe('BaseAppGraphqlContext', () => {
  describe('#saveRefreshTokenCookie()', () => {
    test('should hand the token to the response as an HttpOnly cookie', () => {
      const cookieSpy = jest.fn()

      const context = BaseAppGraphqlContext.create(/** @type {*} */ ({
        expressRequest: {
          context: {
            res: {
              cookie: cookieSpy,
            },
          },
        },
        requestParams: {},
        engine: {
          config: {
            graphqlEndpoint: '/graphql-test',
            refreshTokenCookie: {
              name: 'test_refresh_token',
              ttlDays: 14,
              secure: true,
              sameSite: 'lax',
              httpOnly: true,
            },
          },
        },
        userEntity: null,
        visa: {},
      }))

      context.saveRefreshTokenCookie({
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
            maxAge: 14 * 24 * 60 * 60 * 1000,
          }
        )
    })
  })
})

describe('BaseAppGraphqlContext', () => {
  describe('#clearRefreshTokenCookie()', () => {
    test('should clear the cookie with the same attributes it was written with', () => {
      // The attributes have to match the ones it was written with, or the browser keeps the
      // original cookie and the session appears to survive a sign-out.
      const clearCookieSpy = jest.fn()

      const context = BaseAppGraphqlContext.create(/** @type {*} */ ({
        expressRequest: {
          context: {
            res: {
              clearCookie: clearCookieSpy,
            },
          },
        },
        requestParams: {},
        engine: {
          config: {
            graphqlEndpoint: '/graphql-test',
            refreshTokenCookie: {
              name: 'test_refresh_token',
              ttlDays: 14,
              secure: true,
              sameSite: 'lax',
              httpOnly: true,
            },
          },
        },
        userEntity: null,
        visa: {},
      }))

      context.clearRefreshTokenCookie()

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
