import BaseAppGraphqlContext from '../../../../../server/graphql/contexts/BaseAppGraphqlContext.js'

describe('BaseAppGraphqlContext', () => {
  describe('.get:REFRESH_TOKEN_COOKIE_NAME', () => {
    test('should refuse to answer without a subclass', () => {
      const actual = () => BaseAppGraphqlContext.REFRESH_TOKEN_COOKIE_NAME

      expect(actual)
        .toThrow('BaseAppGraphqlContext.get:REFRESH_TOKEN_COOKIE_NAME must be inherited')
    })
  })
})

describe('BaseAppGraphqlContext', () => {
  describe('.get:REFRESH_TOKEN_COOKIE_PATH', () => {
    test('should refuse to answer without a subclass', () => {
      const actual = () => BaseAppGraphqlContext.REFRESH_TOKEN_COOKIE_PATH

      expect(actual)
        .toThrow('BaseAppGraphqlContext.get:REFRESH_TOKEN_COOKIE_PATH must be inherited')
    })
  })
})

describe('BaseAppGraphqlContext', () => {
  describe('.generateRefreshTokenCookieOptions()', () => {
    test('should carry the attributes an HttpOnly cookie requires and name no Domain', () => {
      // Naming a Domain widens the cookie to every subdomain; `secure` follows the environment,
      // so it is matched by type, not value.
      jest.spyOn(BaseAppGraphqlContext, 'REFRESH_TOKEN_COOKIE_PATH', 'get')
        .mockReturnValue('/graphql-test')

      const expected = {
        httpOnly: true,
        secure: expect.any(Boolean),
        sameSite: 'lax',
        path: '/graphql-test',
      }

      const actual = BaseAppGraphqlContext.generateRefreshTokenCookieOptions()

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
        jest.spyOn(BaseAppGraphqlContext, 'REFRESH_TOKEN_COOKIE_NAME', 'get')
          .mockReturnValue('test_refresh_token')

        const context = BaseAppGraphqlContext.create(/** @type {*} */ ({
          expressRequest: {
            headers: {
              cookie: params.cookieHeader,
            },
          },
          requestParams: {},
          engine: {},
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
        jest.spyOn(BaseAppGraphqlContext, 'REFRESH_TOKEN_COOKIE_NAME', 'get')
          .mockReturnValue('test_refresh_token')

        const context = BaseAppGraphqlContext.create(/** @type {*} */ ({
          expressRequest: {
            headers: {
              cookie: params.cookieHeader,
            },
          },
          requestParams: {},
          engine: {},
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
          engine: {},
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
          engine: {},
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
      jest.spyOn(BaseAppGraphqlContext, 'REFRESH_TOKEN_COOKIE_NAME', 'get')
        .mockReturnValue('test_refresh_token')
      jest.spyOn(BaseAppGraphqlContext, 'REFRESH_TOKEN_COOKIE_PATH', 'get')
        .mockReturnValue('/graphql-test')

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
        engine: {},
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
            secure: expect.any(Boolean),
            sameSite: 'lax',
            path: '/graphql-test',
            maxAge: expect.any(Number),
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
      jest.spyOn(BaseAppGraphqlContext, 'REFRESH_TOKEN_COOKIE_NAME', 'get')
        .mockReturnValue('test_refresh_token')
      jest.spyOn(BaseAppGraphqlContext, 'REFRESH_TOKEN_COOKIE_PATH', 'get')
        .mockReturnValue('/graphql-test')

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
        engine: {},
        userEntity: null,
        visa: {},
      }))

      context.clearRefreshTokenCookie()

      expect(clearCookieSpy)
        .toHaveBeenCalledWith(
          'test_refresh_token',
          {
            httpOnly: true,
            secure: expect.any(Boolean),
            sameSite: 'lax',
            path: '/graphql-test',
          }
        )
    })
  })
})
