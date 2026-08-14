import SignOutMutationResolver from '../../../../../../../../server/graphql/resolvers/admin/actual/mutations/SignOutMutationResolver.js'

import SessionClerk from '../../../../../../../../app/session/SessionClerk.js'
import RefreshTokenExpressCookieClerk from '../../../../../../../../server/graphql/contexts/tools/RefreshTokenExpressCookieClerk.js'

describe('SignOutMutationResolver', () => {
  describe('.get:schema', () => {
    describe('when called as is', () => {
      test('should be fixed value', () => {
        const received = SignOutMutationResolver.schema

        expect(received)
          .toBe('signOut')
      })
    })
  })
})

describe('SignOutMutationResolver', () => {
  describe('.get:errorCodeHash', () => {
    describe('when called as is', () => {
      test('should be fixed value', () => {
        const received = SignOutMutationResolver.errorCodeHash

        expect(received)
          .toEqual({})
      })
    })
  })
})

describe('SignOutMutationResolver', () => {
  describe('#get:RefreshTokenExpressCookieClerkCtor', () => {
    describe('when called as is', () => {
      test('should be fixed value', () => {
        const resolver = SignOutMutationResolver.create()

        const received = resolver.RefreshTokenExpressCookieClerkCtor

        expect(received)
          .toBe(RefreshTokenExpressCookieClerk) // same reference
      })
    })
  })
})

describe('SignOutMutationResolver', () => {
  describe('#get:SessionClerkCtor', () => {
    describe('when called as is', () => {
      test('should be fixed value', () => {
        const resolver = SignOutMutationResolver.create()

        const received = resolver.SessionClerkCtor

        expect(received)
          .toBe(SessionClerk) // same reference
      })
    })
  })
})

describe('SignOutMutationResolver', () => {
  describe('#createSessionClerk()', () => {
    describe('when called as is', () => {
      test('should be a session clerk', () => {
        const resolver = SignOutMutationResolver.create()

        const received = resolver.createSessionClerk()

        expect(received)
          .toBeInstanceOf(SessionClerk)
      })
    })
  })
})

describe('SignOutMutationResolver', () => {
  describe('#createCookieClerk()', () => {
    describe('should be a refresh-token cookie clerk', () => {
      const resolver = SignOutMutationResolver.create()

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

      test.each(cases)('cookieHeader: $input.context.cookieHeader', ({ input }) => {
        const received = resolver.createCookieClerk(input)

        expect(received)
          .toBeInstanceOf(RefreshTokenExpressCookieClerk)
      })
    })
  })
})

describe('SignOutMutationResolver', () => {
  describe('#formatResponse()', () => {
    describe('when called as is', () => {
      test('should report signed out', () => {
        const resolver = SignOutMutationResolver.create()

        const received = resolver.formatResponse()

        expect(received)
          .toEqual({
            isSignedOut: true,
          })
      })
    })
  })
})

describe('SignOutMutationResolver', () => {
  describe('#revokeSeries()', () => {
    describe('should be null when the cookie matched nothing', () => {
      const resolver = SignOutMutationResolver.create()

      const cases = [
        {
          input: {
            context: /** @type {*} */ ({
              now: new Date('2026-08-01T00:00:01.001Z'),
            }),
            refreshTokenEntity: null, // no row matched the presented cookie
          },
        },
        {
          input: {
            context: /** @type {*} */ ({
              now: new Date('2026-08-02T00:00:02.002Z'),
            }),
            refreshTokenEntity: null, // no row matched the presented cookie
          },
        },
      ]

      test.each(cases)('now: $input.context.now', async ({ input }) => {
        const received = await resolver.revokeSeries(input)

        expect(received)
          .toBeNull()
      })
    })
  })
})
