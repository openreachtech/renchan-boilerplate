import RenewAccessTokenMutationResolver from '../../../../../../../../server/graphql/resolvers/admin/actual/mutations/RenewAccessTokenMutationResolver.js'

import SessionClerk from '../../../../../../../../app/session/SessionClerk.js'
import RefreshTokenExpressCookieClerk from '../../../../../../../../server/graphql/contexts/tools/RefreshTokenExpressCookieClerk.js'

describe('RenewAccessTokenMutationResolver', () => {
  describe('.get:schema', () => {
    describe('when called as is', () => {
      test('should be fixed value', () => {
        const received = RenewAccessTokenMutationResolver.schema

        expect(received)
          .toBe('renewAccessToken')
      })
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('.get:errorCodeHash', () => {
    describe('when called as is', () => {
      test('should be fixed value', () => {
        const expected = {
          Unauthenticated: '102.X000.001',
          RefreshTokenReused: '205.M005.001',
        }

        const received = RenewAccessTokenMutationResolver.errorCodeHash

        expect(received)
          .toEqual(expected)
      })
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#get:RefreshTokenExpressCookieClerkCtor', () => {
    describe('when called as is', () => {
      test('should be fixed value', () => {
        const resolver = RenewAccessTokenMutationResolver.create()

        const received = resolver.RefreshTokenExpressCookieClerkCtor

        expect(received)
          .toBe(RefreshTokenExpressCookieClerk) // same reference
      })
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#get:SessionClerkCtor', () => {
    describe('when called as is', () => {
      test('should be fixed value', () => {
        const resolver = RenewAccessTokenMutationResolver.create()

        const received = resolver.SessionClerkCtor

        expect(received)
          .toBe(SessionClerk) // same reference
      })
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#createSessionClerk()', () => {
    describe('when called as is', () => {
      test('should be a session clerk', () => {
        const resolver = RenewAccessTokenMutationResolver.create()

        const received = resolver.createSessionClerk()

        expect(received)
          .toBeInstanceOf(SessionClerk)
      })
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#createCookieClerk()', () => {
    describe('should be a refresh-token cookie clerk', () => {
      const resolver = RenewAccessTokenMutationResolver.create()

      const cases = [
        {
          params: {
            context: /** @type {*} */ ({
              cookieHeader: 'cookie-header-0001',
            }),
          },
        },
        {
          params: {
            context: /** @type {*} */ ({
              cookieHeader: 'cookie-header-0002',
            }),
          },
        },
      ]

      test.each(cases)('context: $params.context.cookieHeader', ({ params }) => {
        const received = resolver.createCookieClerk(params)

        expect(received)
          .toBeInstanceOf(RefreshTokenExpressCookieClerk)
      })
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#formatResponse()', () => {
    describe('should be the access token of the pair', () => {
      const resolver = RenewAccessTokenMutationResolver.create()

      const cases = [
        {
          params: {
            credentialPair: {
              accessTokenEntity: /** @type {*} */ ({
                accessToken: 'access-token-value-0001',
              }),
            },
          },
          expected: {
            accessToken: 'access-token-value-0001',
          },
        },
        {
          params: {
            credentialPair: {
              accessTokenEntity: /** @type {*} */ ({
                accessToken: 'access-token-value-0002',
              }),
            },
          },
          expected: {
            accessToken: 'access-token-value-0002',
          },
        },
      ]

      test.each(cases)('accessToken: $params.credentialPair.accessTokenEntity.accessToken', ({
        params,
        expected,
      }) => {
        const received = resolver.formatResponse(params)

        expect(received)
          .toEqual(expected)
      })
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#resolve()', () => {
    const resolver = RenewAccessTokenMutationResolver.create()

    describe('should refuse a cookie that matches nothing', () => {
      const cases = [
        {
          mockPresentedRefreshToken: null,
          params: {
            context: /** @type {*} */ ({
              now: new Date('2026-08-05T05:00:05.005Z'),
            }),
          },
        },
        {
          mockPresentedRefreshToken: 'unmatched-refresh-token-value-0006',
          params: {
            context: /** @type {*} */ ({
              now: new Date('2026-08-06T05:00:06.006Z'),
            }),
          },
        },
      ]

      test.each(cases)('now: $params.context.now', async ({
        mockPresentedRefreshToken,
        params,
      }) => {
        jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'extractRefreshToken')
          .mockReturnValue(mockPresentedRefreshToken)
        const clearRefreshTokenCookieSpy = jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'clearRefreshTokenCookie')

        const actual = () => resolver.resolve(params)

        await expect(actual)
          .rejects
          .toThrow('102.X000.001')
        expect(clearRefreshTokenCookieSpy)
          .toHaveBeenCalledWith()
      })
    })

    describe('should refuse a refresh token that is no longer available', () => {
      const cases = [
        {
          mockPresentedRefreshToken: 'refresh-token-03-01', // seeded: revoked
          params: {
            context: /** @type {*} */ ({
              now: new Date('2026-08-07T05:00:07.007Z'),
            }),
          },
        },
        {
          mockPresentedRefreshToken: 'refresh-token-16-01', // seeded: expired
          params: {
            context: /** @type {*} */ ({
              now: new Date('2026-08-08T05:00:08.008Z'),
            }),
          },
        },
      ]

      test.each(cases)('now: $params.context.now', async ({
        mockPresentedRefreshToken,
        params,
      }) => {
        jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'extractRefreshToken')
          .mockReturnValue(mockPresentedRefreshToken)
        const clearRefreshTokenCookieSpy = jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'clearRefreshTokenCookie')

        const actual = () => resolver.resolve(params)

        await expect(actual)
          .rejects
          .toThrow('102.X000.001')
        expect(clearRefreshTokenCookieSpy)
          .toHaveBeenCalledWith()
      })
    })
  })
})
