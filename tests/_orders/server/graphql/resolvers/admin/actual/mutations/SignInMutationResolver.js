import SignInMutationResolver from '../../../../../../../../server/graphql/resolvers/admin/actual/mutations/SignInMutationResolver.js'

import AdminAccessToken from '../../../../../../../../sequelize/models/AdminAccessToken.js'
import AdminRefreshToken from '../../../../../../../../sequelize/models/AdminRefreshToken.js'

/**
 * A token is 32 bytes of CSPRNG output rendered as hex.
 */
const ACCESS_TOKEN_PATTERN = /^[0-9a-f]{64}$/u

/**
 * Build a context double carrying the cookie methods the resolver calls.
 *
 * @param {{
 *   now: Date
 * }} params - Parameters.
 * @returns {*} - Context double.
 */
function createContext ({
  now,
}) {
  return {
    now,
    saveRefreshTokenCookie: jest.fn(),
    clearRefreshTokenCookie: jest.fn(),
  }
}

describe('SignInMutationResolver', () => {
  describe('#generateTransactionCallback()', () => {
    describe('to be instance of Function', () => {
      const cases = [
        {
          params: {
            adminId: 100001,
            now: new Date('2024-01-01T00:00:01.001Z'),
          },
        },
        {
          params: {
            adminId: 100002,
            now: new Date('2024-01-02T00:00:02.002Z'),
          },
        },
      ]

      test.each(cases)('adminId: $params.adminId', ({ params }) => {
        const resolver = SignInMutationResolver.create()

        const actual = resolver.generateTransactionCallback(params)

        expect(actual)
          .toBeInstanceOf(Function)
      })
    })

    describe('callback works to save both halves of the pair', () => {
      const cases = [
        {
          params: {
            adminId: 900001,
            now: new Date('2024-11-01T00:00:01.001Z'),
          },
          expected: {
            AdminId: 900001,
            generatedAt: new Date('2024-11-01T00:00:01.001Z'),
            accessExpiredAt: new Date('2024-11-01T00:15:01.001Z'),
            refreshExpiredAt: new Date('2024-11-15T00:00:01.001Z'),
          },
        },
        {
          params: {
            adminId: 900002,
            now: new Date('2024-11-02T00:00:02.002Z'),
          },
          expected: {
            AdminId: 900002,
            generatedAt: new Date('2024-11-02T00:00:02.002Z'),
            accessExpiredAt: new Date('2024-11-02T00:15:02.002Z'),
            refreshExpiredAt: new Date('2024-11-16T00:00:02.002Z'),
          },
        },
      ]

      test.each(cases)('adminId: $params.adminId', async ({ params, expected }) => {
        const resolver = SignInMutationResolver.create()

        const credentialPair = await AdminAccessToken.beginTransaction(
          resolver.generateTransactionCallback(params)
        )

        expect(credentialPair.accessToken)
          .toMatch(ACCESS_TOKEN_PATTERN)
        expect(credentialPair.refreshToken)
          .toMatch(ACCESS_TOKEN_PATTERN)

        const savedAccessToken = await AdminAccessToken.findOne({
          where: {
            accessToken: credentialPair.accessToken,
          },
        })

        expect(savedAccessToken)
          .toHaveProperty('AdminId', expected.AdminId)
        expect(savedAccessToken)
          .toHaveProperty('generatedAt', expected.generatedAt)
        expect(savedAccessToken)
          .toHaveProperty('expiredAt', expected.accessExpiredAt)
        expect(savedAccessToken)
          .toHaveProperty('sessionKey', credentialPair.sessionKey)

        const savedRefreshToken = await AdminRefreshToken.findOne({
          where: {
            tokenHash: AdminRefreshToken.hashToken({
              token: credentialPair.refreshToken,
            }),
          },
        })

        expect(savedRefreshToken)
          .toHaveProperty('AdminId', expected.AdminId)
        expect(savedRefreshToken)
          .toHaveProperty('sessionKey', credentialPair.sessionKey)
        expect(savedRefreshToken)
          .toHaveProperty('expiredAt', expected.refreshExpiredAt)
        expect(savedRefreshToken)
          .toHaveProperty('usedAt', null)
      })
    })
  })
})

describe('SignInMutationResolver', () => {
  describe('#resolve()', () => {
    describe('with existing email and correct password', () => {
      const cases = [
        {
          params: {
            variables: {
              input: {
                email: 'admin.100001@example.com',
                password: 'pAsswOrd$01',
              },
            },
            context: createContext({
              now: new Date('2024-01-01T00:00:01.001Z'),
            }),
          },
          expected: {
            accessToken: expect.stringMatching(ACCESS_TOKEN_PATTERN),
          },
        },
        {
          params: {
            variables: {
              input: {
                email: 'admin.100002@example.com',
                password: 'pAsswOrd$02',
              },
            },
            context: createContext({
              now: new Date('2024-01-02T00:00:02.002Z'),
            }),
          },
          expected: {
            accessToken: expect.stringMatching(ACCESS_TOKEN_PATTERN),
          },
        },
      ]

      test.each(cases)('email: $params.variables.input.email', async ({ params, expected }) => {
        const resolver = SignInMutationResolver.create()

        const actual = await resolver.resolve(params)

        expect(actual)
          .toEqual(expected)

        expect(params.context.saveRefreshTokenCookie)
          .toHaveBeenCalledWith({
            refreshToken: expect.stringMatching(ACCESS_TOKEN_PATTERN),
          })
      })
    })

    describe('with incorrect email or password', () => {
      const cases = [
        {
          params: {
            variables: {
              input: {
                email: 'admin.100001@example.com',
                password: 'incorrectPassword',
              },
            },
            context: createContext({
              now: new Date('2024-01-01T00:00:01.001Z'),
            }),
          },
        },
        {
          params: {
            variables: {
              input: {
                email: 'nobody@example.com',
                password: 'pAsswOrd$02',
              },
            },
            context: createContext({
              now: new Date('2024-01-02T00:00:02.002Z'),
            }),
          },
        },
      ]

      test.each(cases)('email: $params.variables.input.email', async ({ params }) => {
        const resolver = SignInMutationResolver.create()

        const actual = () => resolver.resolve(params)

        await expect(actual)
          .rejects
          .toThrow('202.M001.001')
      })
    })
  })
})
