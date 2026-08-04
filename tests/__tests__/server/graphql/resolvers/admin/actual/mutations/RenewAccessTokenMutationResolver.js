import {
  BaseMutationResolver,
} from '@openreachtech/renchan'

import SessionClerk from '../../../../../../../../app/auth/SessionClerk.js'
import RenewAccessTokenMutationResolver from '../../../../../../../../server/graphql/resolvers/admin/actual/mutations/RenewAccessTokenMutationResolver.js'
import AdminAccessToken from '../../../../../../../../sequelize/models/AdminAccessToken.js'
import AdminRefreshToken from '../../../../../../../../sequelize/models/AdminRefreshToken.js'

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

describe('RenewAccessTokenMutationResolver', () => {
  describe('inheritance', () => {
    test('should be a mutation resolver', () => {
      const actual = RenewAccessTokenMutationResolver.prototype

      expect(actual)
        .toBeInstanceOf(BaseMutationResolver)
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('.get:schema', () => {
    test('to be fixed value', () => {
      const actual = RenewAccessTokenMutationResolver.schema

      expect(actual)
        .toBe('renewAccessToken')
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('.get:errorCodeHash', () => {
    test('should declare its own Unauthenticated code', () => {
      const actual = RenewAccessTokenMutationResolver.errorCodeHash

      expect(actual)
        .toHaveProperty('Unauthenticated', '102.M002.001')
    })

    test('should keep Unauthenticated in the 102 category', () => {
      const [category] = RenewAccessTokenMutationResolver.errorCodeHash
        .Unauthenticated
        .split('.')

      expect(category)
        .toBe('102')
    })

    test('should declare RefreshTokenReused', () => {
      const actual = RenewAccessTokenMutationResolver.errorCodeHash

      expect(actual)
        .toHaveProperty('RefreshTokenReused', '205.M002.001')
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('.create()', () => {
    describe('when called as is', () => {
      test('should be an instance of own class', () => {
        const actual = RenewAccessTokenMutationResolver.create()

        expect(actual)
          .toBeInstanceOf(RenewAccessTokenMutationResolver)
      })

      test('should hold a session clerk', () => {
        const actual = RenewAccessTokenMutationResolver.create()

        expect(actual.sessionClerk)
          .toBeInstanceOf(SessionClerk)
      })

      test('should bind the clerk to the admin tables', () => {
        // Binding the wrong pair here would let one audience's cookie renew the other's session.
        const actual = RenewAccessTokenMutationResolver.create()

        expect(actual.sessionClerk.AccessTokenModel)
          .toBe(AdminAccessToken) // same reference
        expect(actual.sessionClerk.RefreshTokenModel)
          .toBe(AdminRefreshToken) // same reference
      })
    })

    describe('with a session clerk handed in', () => {
      const cases = [
        {
          factoryParams: {
            sessionClerk: /** @type {*} */ ({
              AccessTokenModel: {
                tableName: 'fake_admin_access_tokens_0001',
              },
            }),
          },
        },
        {
          factoryParams: {
            sessionClerk: /** @type {*} */ ({
              AccessTokenModel: {
                tableName: 'fake_admin_access_tokens_0002',
              },
            }),
          },
        },
      ]

      test.each(cases)('sessionClerk: $factoryParams.sessionClerk.AccessTokenModel.tableName', ({ factoryParams }) => {
        const actual = RenewAccessTokenMutationResolver.create(factoryParams)

        expect(actual)
          .toHaveProperty('sessionClerk', factoryParams.sessionClerk)
      })
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#formatResponse()', () => {
    describe('from the credential pair', () => {
      const cases = [
        {
          params: {
            credentialPair: {
              accessToken: 'accessToken.100001',
              refreshToken: 'refreshToken.100001',
              sessionKey: 'sessionKey.100001',
            },
          },
          expected: {
            accessToken: 'accessToken.100001',
          },
        },
        {
          params: {
            credentialPair: {
              accessToken: 'accessToken.100002',
              refreshToken: 'refreshToken.100002',
              sessionKey: 'sessionKey.100002',
            },
          },
          expected: {
            accessToken: 'accessToken.100002',
          },
        },
      ]

      test.each(cases)('accessToken: $params.credentialPair.accessToken', ({ params, expected }) => {
        const resolver = RenewAccessTokenMutationResolver.create()

        const actual = resolver.formatResponse(params)

        expect(actual)
          .toEqual(expected)
      })
    })

    describe('should keep the rotated refresh token out of the body', () => {
      const cases = [
        {
          params: {
            credentialPair: {
              accessToken: 'accessToken.100001',
              refreshToken: 'refreshToken.100001',
              sessionKey: 'sessionKey.100001',
            },
          },
        },
        {
          params: {
            credentialPair: {
              accessToken: 'accessToken.100002',
              refreshToken: 'refreshToken.100002',
              sessionKey: 'sessionKey.100002',
            },
          },
        },
      ]

      test.each(cases)('refreshToken: $params.credentialPair.refreshToken', ({ params }) => {
        const resolver = RenewAccessTokenMutationResolver.create()

        const actual = resolver.formatResponse(params)

        expect(JSON.stringify(actual))
          .not
          .toContain(params.credentialPair.refreshToken)
      })
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#resolve()', () => {
    describe('with a cookie that matches nothing', () => {
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
        const resolver = RenewAccessTokenMutationResolver.create({
          sessionClerk: /** @type {*} */ ({
            findRefreshTokenEntity: async () => null,
          }),
        })
        const context = createContext(params)

        const actual = () => resolver.resolve({ context })

        await expect(actual)
          .rejects
          .toThrow('102.M002.001')

        expect(context.clearRefreshTokenCookie)
          .toHaveBeenCalledWith()
        expect(context.saveRefreshTokenCookie)
          .not
          .toHaveBeenCalled()
      })
    })

    describe('with a spent refresh token', () => {
      const cases = [
        {
          params: {
            refreshToken: 'spent-refresh-token-0001',
            sessionKey: 'admin-session-key-0001',
          },
        },
        {
          params: {
            refreshToken: 'spent-refresh-token-0002',
            sessionKey: 'admin-session-key-0002',
          },
        },
      ]

      test.each(cases)('refreshToken: $params.refreshToken', async ({ params }) => {
        const resolver = RenewAccessTokenMutationResolver.create({
          sessionClerk: /** @type {*} */ ({
            findRefreshTokenEntity: async () => ({
              sessionKey: params.sessionKey,
              AdminId: 100001,
              isUsed: () => true,
              isAvailable: () => false,
            }),
          }),
        })
        const context = createContext(params)

        const revokeSpy = jest.spyOn(resolver, 'revokeReusedSeries')
          .mockResolvedValue(null)

        const actual = () => resolver.resolve({ context })

        await expect(actual)
          .rejects
          .toThrow('205.M002.001')

        expect(revokeSpy)
          .toHaveBeenCalledWith({
            context,
            refreshTokenEntity: expect.objectContaining({
              sessionKey: params.sessionKey,
            }),
          })
        expect(context.clearRefreshTokenCookie)
          .toHaveBeenCalledWith()
      })
    })

    describe('with an expired refresh token', () => {
      const cases = [
        {
          params: {
            refreshToken: 'expired-refresh-token-0001',
          },
        },
        {
          params: {
            refreshToken: 'expired-refresh-token-0002',
          },
        },
      ]

      test.each(cases)('refreshToken: $params.refreshToken', async ({ params }) => {
        const resolver = RenewAccessTokenMutationResolver.create({
          sessionClerk: /** @type {*} */ ({
            findRefreshTokenEntity: async () => ({
              sessionKey: 'admin-session-key-0001',
              AdminId: 100001,
              isUsed: () => false,
              isAvailable: () => false,
            }),
          }),
        })
        const context = createContext(params)

        const revokeSpy = jest.spyOn(resolver, 'revokeReusedSeries')
          .mockResolvedValue(null)

        const actual = () => resolver.resolve({ context })

        await expect(actual)
          .rejects
          .toThrow('102.M002.001')

        expect(revokeSpy)
          .not
          .toHaveBeenCalled()
        expect(context.clearRefreshTokenCookie)
          .toHaveBeenCalledWith()
      })
    })

    describe('with a usable refresh token', () => {
      const cases = [
        {
          params: {
            refreshToken: 'usable-refresh-token-0001',
          },
          expected: {
            accessToken: 'renewed-access-token-0001',
            refreshToken: 'rotated-refresh-token-0001',
          },
        },
        {
          params: {
            refreshToken: 'usable-refresh-token-0002',
          },
          expected: {
            accessToken: 'renewed-access-token-0002',
            refreshToken: 'rotated-refresh-token-0002',
          },
        },
      ]

      test.each(cases)('refreshToken: $params.refreshToken', async ({ params, expected }) => {
        const resolver = RenewAccessTokenMutationResolver.create({
          sessionClerk: /** @type {*} */ ({
            findRefreshTokenEntity: async () => ({
              sessionKey: 'admin-session-key-0001',
              AdminId: 100001,
              isUsed: () => false,
              isAvailable: () => true,
            }),
          }),
        })
        const context = createContext(params)

        jest.spyOn(resolver, 'rotateSession')
          .mockResolvedValue(/** @type {*} */ ({
            accessToken: expected.accessToken,
            refreshToken: expected.refreshToken,
            sessionKey: 'admin-session-key-0001',
          }))

        const actual = await resolver.resolve({ context })

        expect(actual)
          .toEqual({
            accessToken: expected.accessToken,
          })

        expect(context.saveRefreshTokenCookie)
          .toHaveBeenCalledWith({
            refreshToken: expected.refreshToken,
          })
        expect(context.clearRefreshTokenCookie)
          .not
          .toHaveBeenCalled()
      })
    })
  })
})
