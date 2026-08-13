import {
  BaseMutationResolver,
} from '@openreachtech/renchan'

import SignOutMutationResolver from '../../../../../../../../server/graphql/resolvers/customer/actual/mutations/SignOutMutationResolver.js'

import SessionClerk from '../../../../../../../../app/session/SessionClerk.js'
import RefreshTokenExpressCookieClerk from '../../../../../../../../server/graphql/contexts/tools/RefreshTokenExpressCookieClerk.js'

describe('SignOutMutationResolver', () => {
  describe('super class', () => {
    test('to be instance of BaseMutationResolver', () => {
      const received = SignOutMutationResolver.prototype

      expect(received)
        .toBeInstanceOf(BaseMutationResolver)
    })
  })
})

describe('SignOutMutationResolver', () => {
  describe('.get:schema', () => {
    test('should be fixed value', () => {
      const received = SignOutMutationResolver.schema

      expect(received)
        .toBe('signOut')
    })
  })
})

describe('SignOutMutationResolver', () => {
  describe('.get:errorCodeHash', () => {
    test('should be fixed value', () => {
      const expected = {}

      const received = SignOutMutationResolver.errorCodeHash

      expect(received)
        .toEqual(expected)
    })
  })
})

describe('SignOutMutationResolver', () => {
  describe('#get:RefreshTokenExpressCookieClerkCtor', () => {
    test('should be fixed value', () => {
      const resolver = SignOutMutationResolver.create()

      const received = resolver.RefreshTokenExpressCookieClerkCtor

      expect(received)
        .toBe(RefreshTokenExpressCookieClerk) // same reference
    })
  })
})

describe('SignOutMutationResolver', () => {
  describe('#get:SessionClerkCtor', () => {
    test('should be fixed value', () => {
      const resolver = SignOutMutationResolver.create()

      const received = resolver.SessionClerkCtor

      expect(received)
        .toBe(SessionClerk) // same reference
    })
  })
})

describe('SignOutMutationResolver', () => {
  describe('#createCookieClerk()', () => {
    describe('should be a refresh-token cookie clerk', () => {
      const resolver = SignOutMutationResolver.create()

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

      test.each(cases)('cookieHeader: $params.context.cookieHeader', ({
        params,
      }) => {
        const received = resolver.createCookieClerk(params)

        expect(received)
          .toBeInstanceOf(RefreshTokenExpressCookieClerk)
      })
    })
  })
})

describe('SignOutMutationResolver', () => {
  describe('#createSessionClerk()', () => {
    test('should be a session clerk', () => {
      const resolver = SignOutMutationResolver.create()

      const received = resolver.createSessionClerk()

      expect(received)
        .toBeInstanceOf(SessionClerk)
    })
  })
})

describe('SignOutMutationResolver', () => {
  describe('#formatResponse()', () => {
    test('should report signed out', () => {
      const expected = {
        isSignedOut: true,
      }

      const resolver = SignOutMutationResolver.create()

      const received = resolver.formatResponse()

      expect(received)
        .toEqual(expected)
    })
  })
})

describe('SignOutMutationResolver', () => {
  describe('#resolve()', () => {
    describe('should clear the cookie and succeed when the cookie matches nothing', () => {
      const resolver = SignOutMutationResolver.create()

      const cases = [
        {
          mockRefreshToken: null,
          params: {
            context: /** @type {*} */ ({
              now: new Date('2026-09-05T05:00:05.005Z'),
            }),
          },
          expected: {
            isSignedOut: true,
          },
        },
        {
          mockRefreshToken: 'unmatched-refresh-token-value-0006',
          params: {
            context: /** @type {*} */ ({
              now: new Date('2026-09-06T05:00:06.006Z'),
            }),
          },
          expected: {
            isSignedOut: true,
          },
        },
      ]

      test.each(cases)('mockRefreshToken: $mockRefreshToken', async ({
        mockRefreshToken,
        params,
        expected,
      }) => {
        jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'extractRefreshToken')
          .mockReturnValue(mockRefreshToken)

        const received = await resolver.resolve(params)

        expect(received)
          .toEqual(expected)
      })
    })
  })
})

describe('SignOutMutationResolver', () => {
  describe('#revokeSeries()', () => {
    describe('when the cookie matched nothing', () => {
      const resolver = SignOutMutationResolver.create()

      const cases = [
        {
          params: {
            now: new Date('2026-09-07T06:00:07.007Z'),
          },
        },
        {
          params: {
            now: new Date('2026-09-08T06:00:08.008Z'),
          },
        },
      ]

      test.each(cases)('now: $params.now', async ({
        params,
      }) => {
        const args = {
          context: /** @type {*} */ ({
            now: params.now,
          }),
          refreshTokenEntity: null,
        }

        const received = await resolver.revokeSeries(args)

        expect(received)
          .toBeNull()
      })
    })
  })
})
