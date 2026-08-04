import RenewAccessTokenMutationResolver from '../../../../../../../../server/graphql/resolvers/customer/actual/mutations/RenewAccessTokenMutationResolver.js'
import SignInMutationResolver from '../../../../../../../../server/graphql/resolvers/customer/actual/mutations/SignInMutationResolver.js'

import CustomerAccessToken from '../../../../../../../../sequelize/models/CustomerAccessToken.js'
import CustomerRefreshToken from '../../../../../../../../sequelize/models/CustomerRefreshToken.js'

/**
 * A token is 32 bytes of CSPRNG output rendered as hex.
 */
const TOKEN_PATTERN = /^[0-9a-f]{64}$/u

/**
 * Build a context double that carries a refresh cookie in and records what happened to it.
 *
 * @param {{
 *   refreshToken?: string | null
 *   now?: Date
 * }} [params] - Parameters.
 * @returns {*} - Context double.
 */
function createContext ({
  refreshToken = null,
  now = new Date('2026-08-01T00:00:00.000Z'),
} = {}) {
  return {
    now,
    extractRefreshToken: () => refreshToken,
    saveRefreshTokenCookie: jest.fn(),
    clearRefreshTokenCookie: jest.fn(),
  }
}

/**
 * Sign an account in, so there is a real series to rotate.
 *
 * @param {{
 *   customerId: number
 * }} params - Parameters.
 * @returns {Promise<*>} - The credential pair that was issued.
 */
async function issueSession ({
  customerId,
}) {
  return SignInMutationResolver.create()
    .saveSession({
      context: createContext(),
      customerId,
    })
}

describe('RenewAccessTokenMutationResolver', () => {
  describe('#resolve()', () => {
    describe('should rotate the refresh token', () => {
      const cases = [
        {
          params: {
            customerId: 910001,
          },
        },
        {
          params: {
            customerId: 910002,
          },
        },
      ]

      test.each(cases)('customerId: $params.customerId', async ({ params }) => {
        const issued = await issueSession(params)

        const context = createContext({
          refreshToken: issued.refreshToken,
        })

        const actual = await RenewAccessTokenMutationResolver.create()
          .resolve({ context })

        // A fresh access token, and a fresh refresh token to go with it. Handing the same refresh
        // token back would leave nothing to detect a leak by.
        expect(actual.accessToken)
          .toMatch(TOKEN_PATTERN)
        expect(actual.accessToken)
          .not
          .toBe(issued.accessToken)

        expect(context.saveRefreshTokenCookie)
          .toHaveBeenCalledWith({
            refreshToken: expect.stringMatching(TOKEN_PATTERN),
          })

        const [[{ refreshToken: rotatedRefreshToken }]] = context.saveRefreshTokenCookie.mock.calls

        expect(rotatedRefreshToken)
          .not
          .toBe(issued.refreshToken)
      })
    })

    describe('should mark the presented token spent', () => {
      const cases = [
        {
          params: {
            customerId: 910003,
          },
        },
        {
          params: {
            customerId: 910004,
          },
        },
      ]

      test.each(cases)('customerId: $params.customerId', async ({ params }) => {
        const issued = await issueSession(params)

        await RenewAccessTokenMutationResolver.create()
          .resolve({
            context: createContext({
              refreshToken: issued.refreshToken,
            }),
          })

        const spentRow = await CustomerRefreshToken.findOne({
          where: {
            tokenHash: CustomerRefreshToken.hashToken({
              token: issued.refreshToken,
            }),
          },
        })

        expect(spentRow.usedAt)
          .not
          .toBeNull()
      })
    })

    describe('should keep the new pair in the same series', () => {
      const cases = [
        {
          params: {
            customerId: 910005,
          },
        },
        {
          params: {
            customerId: 910006,
          },
        },
      ]

      test.each(cases)('customerId: $params.customerId', async ({ params }) => {
        const issued = await issueSession(params)

        const actual = await RenewAccessTokenMutationResolver.create()
          .resolve({
            context: createContext({
              refreshToken: issued.refreshToken,
            }),
          })

        const renewedAccessToken = await CustomerAccessToken.findOne({
          where: {
            accessToken: actual.accessToken,
          },
        })

        // Rotation continues a series rather than starting one, so signing out still revokes
        // everything that descends from the original sign-in.
        expect(renewedAccessToken)
          .toHaveProperty('sessionKey', issued.sessionKey)
      })
    })

    describe('should refuse a refresh token that was already exchanged', () => {
      const cases = [
        {
          params: {
            customerId: 910007,
          },
        },
        {
          params: {
            customerId: 910008,
          },
        },
      ]

      test.each(cases)('customerId: $params.customerId', async ({ params }) => {
        const issued = await issueSession(params)

        await RenewAccessTokenMutationResolver.create()
          .resolve({
            context: createContext({
              refreshToken: issued.refreshToken,
            }),
          })

        // Presenting it a second time means two parties hold it — the legitimate client and
        // whoever copied it. There is no telling which is which, so the whole series is refused.
        const actual = () => RenewAccessTokenMutationResolver.create()
          .resolve({
            context: createContext({
              refreshToken: issued.refreshToken,
            }),
          })

        await expect(actual)
          .rejects
          .toThrow('205.M003.001')
      })
    })

    describe('should revoke the whole series when a token is reused', () => {
      const cases = [
        {
          params: {
            customerId: 910009,
          },
        },
        {
          params: {
            customerId: 910010,
          },
        },
      ]

      test.each(cases)('customerId: $params.customerId', async ({ params }) => {
        const issued = await issueSession(params)

        const renewed = await RenewAccessTokenMutationResolver.create()
          .resolve({
            context: createContext({
              refreshToken: issued.refreshToken,
            }),
          })

        const reuse = () => RenewAccessTokenMutationResolver.create()
          .resolve({
            context: createContext({
              refreshToken: issued.refreshToken,
            }),
          })

        await expect(reuse)
          .rejects
          .toThrow('205.M003.001')

        // The access token the legitimate client is holding right now goes too. Revoking only the
        // replayed row would leave the freshly minted one working for whoever holds it.
        const survivingAccessToken = await CustomerAccessToken.findOne({
          where: {
            accessToken: renewed.accessToken,
          },
        })

        expect(survivingAccessToken)
          .toBeNull()

        const seriesRows = await CustomerRefreshToken.findAll({
          where: {
            sessionKey: issued.sessionKey,
          },
        })

        expect(seriesRows)
          .toHaveLength(2)

        const areAllRowsRevoked = seriesRows.every(row =>
          row.revokedAt !== null
        )

        expect(areAllRowsRevoked)
          .toBeTruthy()
      })
    })

    describe('should refuse a cookie that matches nothing', () => {
      const cases = [
        {
          params: {
            refreshToken: null,
          },
        },
        {
          params: {
            refreshToken: 'a'.repeat(64),
          },
        },
      ]

      test.each(cases)('refreshToken: $params.refreshToken', async ({ params }) => {
        const context = createContext(params)

        const actual = () => RenewAccessTokenMutationResolver.create()
          .resolve({ context })

        await expect(actual)
          .rejects
          .toThrow('102.M003.001')

        expect(context.clearRefreshTokenCookie)
          .toHaveBeenCalledWith()
      })
    })

    describe('should refuse a refresh token past its expiry', () => {
      const cases = [
        {
          params: {
            customerId: 910011,
          },
        },
        {
          params: {
            customerId: 910012,
          },
        },
      ]

      test.each(cases)('customerId: $params.customerId', async ({ params }) => {
        const issued = await issueSession(params)

        const row = await CustomerRefreshToken.findOne({
          where: {
            tokenHash: CustomerRefreshToken.hashToken({
              token: issued.refreshToken,
            }),
          },
        })

        await row.update({
          expiredAt: new Date('2020-01-01T00:00:00.000Z'),
        })

        const actual = () => RenewAccessTokenMutationResolver.create()
          .resolve({
            context: createContext({
              refreshToken: issued.refreshToken,
            }),
          })

        await expect(actual)
          .rejects
          .toThrow('102.M003.001')

        // Expiry is not a leak, so the series is left alone. Revoking here would make an ordinary
        // lapse indistinguishable from an attack.
        const seriesRows = await CustomerRefreshToken.findAll({
          where: {
            sessionKey: issued.sessionKey,
          },
        })

        const areAllRowsIntact = seriesRows.every(seriesRow =>
          seriesRow.revokedAt === null
        )

        expect(areAllRowsIntact)
          .toBeTruthy()
      })
    })
  })
})
