import {
  BaseMutationResolver,
} from '@openreachtech/renchan'

import SessionClerk from '../../../../../../../../app/auth/SessionClerk.js'
import SignOutMutationResolver from '../../../../../../../../server/graphql/resolvers/customer/actual/mutations/SignOutMutationResolver.js'
import CustomerAccessToken from '../../../../../../../../sequelize/models/CustomerAccessToken.js'
import CustomerRefreshToken from '../../../../../../../../sequelize/models/CustomerRefreshToken.js'

/**
 * Build a context double that records what the resolver did to the cookie.
 *
 * @param {{
 *   refreshToken: string | null
 * }} params - Parameters.
 * @returns {*} - Context double.
 */
function createContext ({
  refreshToken,
}) {
  return {
    now: new Date('2026-08-01T00:00:00.000Z'),
    extractRefreshToken: () => refreshToken,
    saveRefreshTokenCookie: jest.fn(),
    clearRefreshTokenCookie: jest.fn(),
  }
}

describe('SignOutMutationResolver', () => {
  describe('inheritance', () => {
    test('should be a mutation resolver', () => {
      const actual = SignOutMutationResolver.prototype

      expect(actual)
        .toBeInstanceOf(BaseMutationResolver)
    })
  })
})

describe('SignOutMutationResolver', () => {
  describe('.get:schema', () => {
    test('to be fixed value', () => {
      const actual = SignOutMutationResolver.schema

      expect(actual)
        .toBe('signOut')
    })
  })
})

describe('SignOutMutationResolver', () => {
  describe('.get:errorCodeHash', () => {
    test('to declare no codes of its own', () => {
      const expected = {}

      const actual = SignOutMutationResolver.errorCodeHash

      expect(actual)
        .toEqual(expected)
    })
  })
})

describe('SignOutMutationResolver', () => {
  describe('.create()', () => {
    describe('when called as is', () => {
      test('should be an instance of own class', () => {
        const actual = SignOutMutationResolver.create()

        expect(actual)
          .toBeInstanceOf(SignOutMutationResolver)
      })

      test('should bind the clerk to the customer tables', () => {
        const actual = SignOutMutationResolver.create()

        expect(actual.sessionClerk)
          .toBeInstanceOf(SessionClerk)
        expect(actual.sessionClerk.AccessTokenModel)
          .toBe(CustomerAccessToken) // same reference
        expect(actual.sessionClerk.RefreshTokenModel)
          .toBe(CustomerRefreshToken) // same reference
      })
    })

    describe('with a session clerk handed in', () => {
      const cases = [
        {
          factoryParams: {
            sessionClerk: /** @type {*} */ ({
              AccessTokenModel: {
                tableName: 'fake_customer_access_tokens_0001',
              },
            }),
          },
        },
        {
          factoryParams: {
            sessionClerk: /** @type {*} */ ({
              AccessTokenModel: {
                tableName: 'fake_customer_access_tokens_0002',
              },
            }),
          },
        },
      ]

      test.each(cases)('sessionClerk: $factoryParams.sessionClerk.AccessTokenModel.tableName', ({ factoryParams }) => {
        const actual = SignOutMutationResolver.create(factoryParams)

        expect(actual)
          .toHaveProperty('sessionClerk', factoryParams.sessionClerk)
      })
    })
  })
})

describe('SignOutMutationResolver', () => {
  describe('#formatResponse()', () => {
    test('should always report a completed sign-out', () => {
      const expected = {
        signedOut: true,
      }

      const actual = SignOutMutationResolver.create()
        .formatResponse()

      expect(actual)
        .toEqual(expected)
    })
  })
})

describe('SignOutMutationResolver', () => {
  describe('#resolve()', () => {
    describe('with a cookie that matches nothing', () => {
      // A missing or unknown cookie is reported as success, so no one can probe whether a given
      // refresh token names a live session.
      const cases = [
        {
          params: {
            refreshToken: null,
          },
        },
        {
          params: {
            refreshToken: 'unknown-refresh-token',
          },
        },
      ]

      test.each(cases)('refreshToken: $params.refreshToken', async ({ params }) => {
        const resolver = SignOutMutationResolver.create({
          sessionClerk: /** @type {*} */ ({
            findRefreshTokenEntity: async () => null,
          }),
        })
        const context = createContext(params)

        const revokeSpy = jest.spyOn(resolver, 'revokeSession')

        const actual = await resolver.resolve({ context })

        expect(actual)
          .toEqual({
            signedOut: true,
          })

        expect(context.clearRefreshTokenCookie)
          .toHaveBeenCalledWith()
        expect(revokeSpy)
          .not
          .toHaveBeenCalled()
      })
    })

    describe('with a cookie that matches a session', () => {
      const cases = [
        {
          params: {
            refreshToken: 'live-refresh-token-0001',
            sessionKey: 'session-key-0001',
          },
        },
        {
          params: {
            refreshToken: 'live-refresh-token-0002',
            sessionKey: 'session-key-0002',
          },
        },
      ]

      test.each(cases)('refreshToken: $params.refreshToken', async ({ params }) => {
        const refreshTokenEntity = {
          sessionKey: params.sessionKey,
          CustomerId: 100001,
        }

        const resolver = SignOutMutationResolver.create({
          sessionClerk: /** @type {*} */ ({
            findRefreshTokenEntity: async () => refreshTokenEntity,
          }),
        })
        const context = createContext(params)

        const revokeSpy = jest.spyOn(resolver, 'revokeSession')
          .mockResolvedValue(null)

        const actual = await resolver.resolve({ context })

        expect(actual)
          .toEqual({
            signedOut: true,
          })

        expect(revokeSpy)
          .toHaveBeenCalledWith({
            context,
            refreshTokenEntity,
          })
        expect(context.clearRefreshTokenCookie)
          .toHaveBeenCalledWith()
      })
    })
  })
})
