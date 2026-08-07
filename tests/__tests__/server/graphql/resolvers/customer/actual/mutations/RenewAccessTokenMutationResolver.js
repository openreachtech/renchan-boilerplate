import RenewAccessTokenMutationResolver from '../../../../../../../../server/graphql/resolvers/customer/actual/mutations/RenewAccessTokenMutationResolver.js'

import RefreshTokenFinder from '../../../../../../../../app/auth/RefreshTokenFinder.js'
import RefreshTokenSpender from '../../../../../../../../app/auth/RefreshTokenSpender.js'
import SessionRegisterer from '../../../../../../../../app/auth/SessionRegisterer.js'
import SessionRevoker from '../../../../../../../../app/auth/SessionRevoker.js'
import RefreshTokenExpressCookieClerk from '../../../../../../../../server/graphql/contexts/tools/RefreshTokenExpressCookieClerk.js'

describe('RenewAccessTokenMutationResolver', () => {
  describe('.get:schema', () => {
    test('should be renewAccessToken', () => {
      const received = RenewAccessTokenMutationResolver.schema

      expect(received)
        .toBe('renewAccessToken')
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('.get:errorCodeHash', () => {
    test('should hold the unauthenticated and reuse codes', () => {
      const expected = {
        Unauthenticated: '102.X000.001',
        RefreshTokenReused: '205.M003.001',
      }

      const received = RenewAccessTokenMutationResolver.errorCodeHash

      expect(received)
        .toEqual(expected)
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#get:RefreshTokenExpressCookieClerkCtor', () => {
    test('should be the RefreshTokenExpressCookieClerk class', () => {
      const resolver = RenewAccessTokenMutationResolver.create()

      const received = resolver.RefreshTokenExpressCookieClerkCtor

      expect(received)
        .toBe(RefreshTokenExpressCookieClerk) // same reference
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#get:SessionRegistererCtor', () => {
    test('should be the SessionRegisterer class', () => {
      const resolver = RenewAccessTokenMutationResolver.create()

      const received = resolver.SessionRegistererCtor

      expect(received)
        .toBe(SessionRegisterer) // same reference
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#createSessionRegisterer()', () => {
    test('should be a session registerer', () => {
      const resolver = RenewAccessTokenMutationResolver.create()

      const received = resolver.createSessionRegisterer()

      expect(received)
        .toBeInstanceOf(SessionRegisterer)
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#get:RefreshTokenFinderCtor', () => {
    test('should be the RefreshTokenFinder class', () => {
      const resolver = RenewAccessTokenMutationResolver.create()

      const received = resolver.RefreshTokenFinderCtor

      expect(received)
        .toBe(RefreshTokenFinder) // same reference
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#get:SessionRevokerCtor', () => {
    test('should be the SessionRevoker class', () => {
      const resolver = RenewAccessTokenMutationResolver.create()

      const received = resolver.SessionRevokerCtor

      expect(received)
        .toBe(SessionRevoker) // same reference
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#createRefreshTokenFinder()', () => {
    test('should be a refresh token finder', () => {
      const resolver = RenewAccessTokenMutationResolver.create()

      const received = resolver.createRefreshTokenFinder()

      expect(received)
        .toBeInstanceOf(RefreshTokenFinder)
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#createSessionRevoker()', () => {
    test('should be a session revoker', () => {
      const resolver = RenewAccessTokenMutationResolver.create()

      const received = resolver.createSessionRevoker()

      expect(received)
        .toBeInstanceOf(SessionRevoker)
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#get:RefreshTokenSpenderCtor', () => {
    test('should be the RefreshTokenSpender class', () => {
      const resolver = RenewAccessTokenMutationResolver.create()

      const received = resolver.RefreshTokenSpenderCtor

      expect(received)
        .toBe(RefreshTokenSpender) // same reference
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#createRefreshTokenSpender()', () => {
    test('should be a refresh token spender', () => {
      const resolver = RenewAccessTokenMutationResolver.create()

      const received = resolver.createRefreshTokenSpender()

      expect(received)
        .toBeInstanceOf(RefreshTokenSpender)
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#createCookieClerk()', () => {
    describe('should be a refresh-token cookie clerk', () => {
      const cases = [
        {
          input: {
            context: /** @type {*} */ ({
              cookieHeader: 'cookie-header-0001',
            }),
          },
        },
        {
          input: {
            context: /** @type {*} */ ({
              cookieHeader: 'cookie-header-0002',
            }),
          },
        },
      ]

      test.each(cases)('context: $input.context.cookieHeader', ({ input }) => {
        const resolver = RenewAccessTokenMutationResolver.create()
        const args = {
          context: input.context,
        }

        const received = resolver.createCookieClerk(args)

        expect(received)
          .toBeInstanceOf(RefreshTokenExpressCookieClerk)
      })
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#formatResponse()', () => {
    describe('should be the access token of the pair', () => {
      const cases = [
        {
          input: {
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
          input: {
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

      test.each(cases)('accessToken: $input.credentialPair.accessToken', ({
        input,
        expected,
      }) => {
        const resolver = RenewAccessTokenMutationResolver.create()
        const args = {
          credentialPair: input.credentialPair,
        }

        const received = resolver.formatResponse(args)

        expect(received)
          .toEqual(expected)
      })
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#resolve()', () => {
    describe('should refuse a cookie that matches nothing', () => {
      const cases = [
        {
          input: {
            presentedRefreshToken: null,
            now: new Date('2026-08-05T05:00:05.005Z'),
          },
        },
        {
          input: {
            presentedRefreshToken: 'unmatched-refresh-token-value-0006',
            now: new Date('2026-08-06T05:00:06.006Z'),
          },
        },
      ]

      test.each(cases)('presentedRefreshToken: $input.presentedRefreshToken', async ({ input }) => {
        jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'extractRefreshToken')
          .mockReturnValue(input.presentedRefreshToken)
        const clearRefreshTokenCookieSpy = jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'clearRefreshTokenCookie')
        const resolver = RenewAccessTokenMutationResolver.create()
        const args = {
          context: /** @type {*} */ ({
            now: input.now,
          }),
        }

        const actual = () => resolver.resolve(args)

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
          input: {
            presentedRefreshToken: 'refresh-token-03-01', // seeded: revoked
            now: new Date('2026-08-07T05:00:07.007Z'),
          },
        },
        {
          input: {
            presentedRefreshToken: 'refresh-token-16-01', // seeded: expired
            now: new Date('2026-08-08T05:00:08.008Z'),
          },
        },
      ]

      test.each(cases)('presentedRefreshToken: $input.presentedRefreshToken', async ({ input }) => {
        jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'extractRefreshToken')
          .mockReturnValue(input.presentedRefreshToken)
        const clearRefreshTokenCookieSpy = jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'clearRefreshTokenCookie')
        const resolver = RenewAccessTokenMutationResolver.create()
        const args = {
          context: /** @type {*} */ ({
            now: input.now,
          }),
        }

        const actual = () => resolver.resolve(args)

        await expect(actual)
          .rejects
          .toThrow('102.X000.001')
        expect(clearRefreshTokenCookieSpy)
          .toHaveBeenCalledWith()
      })
    })
  })
})
