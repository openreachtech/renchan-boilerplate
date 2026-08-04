import SignInMutationResolver from '../../../../../../../../server/graphql/resolvers/customer/actual/mutations/SignInMutationResolver.js'

import CustomerAccessToken from '../../../../../../../../sequelize/models/CustomerAccessToken.js'
import CustomerRefreshToken from '../../../../../../../../sequelize/models/CustomerRefreshToken.js'

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
            customerId: 100001,
            now: new Date('2024-01-01T00:00:01.001Z'),
          },
        },
        {
          params: {
            customerId: 100002,
            now: new Date('2024-01-02T00:00:02.002Z'),
          },
        },
      ]

      test.each(cases)('customerId: $params.customerId', ({ params }) => {
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
            customerId: 900001,
            now: new Date('2024-11-01T00:00:01.001Z'),
          },
          expected: {
            CustomerId: 900001,
            generatedAt: new Date('2024-11-01T00:00:01.001Z'),
            accessExpiredAt: new Date('2024-11-01T00:15:01.001Z'),
            refreshExpiredAt: new Date('2024-11-15T00:00:01.001Z'),
          },
        },
        {
          params: {
            customerId: 900002,
            now: new Date('2024-11-02T00:00:02.002Z'),
          },
          expected: {
            CustomerId: 900002,
            generatedAt: new Date('2024-11-02T00:00:02.002Z'),
            accessExpiredAt: new Date('2024-11-02T00:15:02.002Z'),
            refreshExpiredAt: new Date('2024-11-16T00:00:02.002Z'),
          },
        },
      ]

      test.each(cases)('customerId: $params.customerId', async ({ params, expected }) => {
        const resolver = SignInMutationResolver.create()

        const credentialPair = await CustomerAccessToken.beginTransaction(
          resolver.generateTransactionCallback(params)
        )

        expect(credentialPair.accessToken)
          .toMatch(ACCESS_TOKEN_PATTERN)
        expect(credentialPair.refreshToken)
          .toMatch(ACCESS_TOKEN_PATTERN)

        const savedAccessToken = await CustomerAccessToken.findOne({
          where: {
            accessToken: credentialPair.accessToken,
          },
        })

        expect(savedAccessToken)
          .toHaveProperty('CustomerId', expected.CustomerId)
        expect(savedAccessToken)
          .toHaveProperty('generatedAt', expected.generatedAt)
        expect(savedAccessToken)
          .toHaveProperty('expiredAt', expected.accessExpiredAt)

        // Both rows carry the same series key, which is what lets signing out — and reuse
        // detection — revoke the access tokens a series already handed out.
        expect(savedAccessToken)
          .toHaveProperty('sessionKey', credentialPair.sessionKey)

        const savedRefreshToken = await CustomerRefreshToken.findOne({
          where: {
            tokenHash: CustomerRefreshToken.hashToken({
              token: credentialPair.refreshToken,
            }),
          },
        })

        expect(savedRefreshToken)
          .toHaveProperty('CustomerId', expected.CustomerId)
        expect(savedRefreshToken)
          .toHaveProperty('sessionKey', credentialPair.sessionKey)
        expect(savedRefreshToken)
          .toHaveProperty('expiredAt', expected.refreshExpiredAt)
        expect(savedRefreshToken)
          .toHaveProperty('usedAt', null)
      })
    })

    describe('should store the refresh token only as a digest', () => {
      // A dump of this table must not be a set of working sessions.
      const cases = [
        {
          params: {
            customerId: 900003,
            now: new Date('2024-11-03T00:00:03.003Z'),
          },
        },
        {
          params: {
            customerId: 900004,
            now: new Date('2024-11-04T00:00:04.004Z'),
          },
        },
      ]

      test.each(cases)('customerId: $params.customerId', async ({ params }) => {
        const resolver = SignInMutationResolver.create()

        const credentialPair = await CustomerAccessToken.beginTransaction(
          resolver.generateTransactionCallback(params)
        )

        const plainTextRow = await CustomerRefreshToken.findOne({
          where: {
            tokenHash: credentialPair.refreshToken,
          },
        })

        expect(plainTextRow)
          .toBeNull()
      })
    })
  })
})

describe('SignInMutationResolver', () => {
  describe('#saveSession()', () => {
    describe('to call #generateTransactionCallback()', () => {
      const cases = [
        {
          params: {
            context: createContext({
              now: new Date('2024-01-01T00:00:01.001Z'),
            }),
            customerId: 100001,
          },
          expected: {
            customerId: 100001,
            now: new Date('2024-01-01T00:00:01.001Z'),
          },
        },
        {
          params: {
            context: createContext({
              now: new Date('2024-01-02T00:00:02.002Z'),
            }),
            customerId: 100002,
          },
          expected: {
            customerId: 100002,
            now: new Date('2024-01-02T00:00:02.002Z'),
          },
        },
      ]

      test.each(cases)('customerId: $params.customerId', async ({ params, expected }) => {
        const resolver = SignInMutationResolver.create()

        const callbackTally = /** @type {*} */ (async () => {})
        const resultTally = {
          value: Symbol('tally'),
        }

        const generateTransactionCallbackSpy = jest.spyOn(resolver, 'generateTransactionCallback')
          .mockReturnValue(callbackTally)
        const beginTransactionSpy = jest.spyOn(CustomerAccessToken, 'beginTransaction')
          .mockImplementation(async () => resultTally)

        const actual = await resolver.saveSession(params)

        expect(actual)
          .toBe(resultTally) // same reference

        expect(generateTransactionCallbackSpy)
          .toHaveBeenCalledWith(expected)
        expect(beginTransactionSpy)
          .toHaveBeenCalledWith(callbackTally)
      })
    })

    describe('to be the credential pair', () => {
      const cases = [
        {
          params: {
            context: createContext({
              now: new Date('2024-11-01T00:00:01.001Z'),
            }),
            customerId: 100001,
          },
          expected: {
            CustomerId: 100001,
            generatedAt: new Date('2024-11-01T00:00:01.001Z'),
            expiredAt: new Date('2024-11-01T00:15:01.001Z'),
          },
        },
        {
          params: {
            context: createContext({
              now: new Date('2024-11-02T00:00:02.002Z'),
            }),
            customerId: 100002,
          },
          expected: {
            CustomerId: 100002,
            generatedAt: new Date('2024-11-02T00:00:02.002Z'),
            expiredAt: new Date('2024-11-02T00:15:02.002Z'),
          },
        },
      ]

      test.each(cases)('customerId: $params.customerId', async ({ params, expected }) => {
        const resolver = SignInMutationResolver.create()

        const actual = await resolver.saveSession(params)

        // A session is a pair, and the refresh half never becomes a response field, so the caller
        // is handed the values rather than a row.
        expect(actual.accessToken)
          .toMatch(ACCESS_TOKEN_PATTERN)
        expect(actual.refreshToken)
          .toMatch(ACCESS_TOKEN_PATTERN)
        expect(actual.accessToken)
          .not
          .toBe(actual.refreshToken)

        const savedAccessToken = await CustomerAccessToken.findOne({
          where: {
            accessToken: actual.accessToken,
          },
        })

        expect(savedAccessToken)
          .toHaveProperty('CustomerId', expected.CustomerId)
        expect(savedAccessToken)
          .toHaveProperty('generatedAt', expected.generatedAt)
        expect(savedAccessToken)
          .toHaveProperty('expiredAt', expected.expiredAt)
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
                email: 'customer.100001@example.com',
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
                email: 'customer.100002@example.com',
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
      })
    })

    describe('should hand the refresh token to the browser as a cookie', () => {
      const cases = [
        {
          params: {
            variables: {
              input: {
                email: 'customer.100001@example.com',
                password: 'pAsswOrd$01',
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
                email: 'customer.100002@example.com',
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

        await resolver.resolve(params)

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
                email: 'customer.100001@example.com',
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
                email: 'incorrect.email@example.com',
                password: 'pAsswOrd$02',
              },
            },
            context: createContext({
              now: new Date('2024-01-02T00:00:02.002Z'),
            }),
          },
        },
        {
          params: {
            variables: {
              input: {
                email: 'incorrect.both@example.com',
                password: 'incorrectBoth',
              },
            },
            context: createContext({
              now: new Date('2024-01-03T00:00:03.003Z'),
            }),
          },
        },
      ]

      test.each(cases)('email: $params.variables.input.email', async ({ params }) => {
        const resolver = SignInMutationResolver.create()

        const actual = () => resolver.resolve(params)

        await expect(actual)
          .rejects
          .toThrow('202.M002.001')
      })
    })
  })
})
