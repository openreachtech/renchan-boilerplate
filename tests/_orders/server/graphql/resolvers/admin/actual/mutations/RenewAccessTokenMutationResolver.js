import RenewAccessTokenMutationResolver from '../../../../../../../../server/graphql/resolvers/admin/actual/mutations/RenewAccessTokenMutationResolver.js'
import SignInMutationResolver from '../../../../../../../../server/graphql/resolvers/admin/actual/mutations/SignInMutationResolver.js'

import AdminAccessToken from '../../../../../../../../sequelize/models/AdminAccessToken.js'
import AdminRefreshToken from '../../../../../../../../sequelize/models/AdminRefreshToken.js'

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
 * Issue a real admin session, so there is a series to rotate.
 *
 * @param {{
 *   adminId: number
 * }} params - Parameters.
 * @returns {Promise<*>} - The credential pair that was issued.
 */
async function issueAdminSession ({
  adminId,
}) {
  return AdminAccessToken.beginTransaction(
    SignInMutationResolver.create()
      .generateTransactionCallback({
        adminId,
        now: new Date('2026-08-01T00:00:00.000Z'),
      })
  )
}

describe('RenewAccessTokenMutationResolver', () => {
  describe('#resolve()', () => {
    describe('should rotate the refresh token', () => {
      const cases = [
        {
          params: {
            adminId: 930001,
          },
        },
        {
          params: {
            adminId: 930002,
          },
        },
      ]

      test.each(cases)('adminId: $params.adminId', async ({ params }) => {
        const issued = await issueAdminSession(params)

        const context = createContext({
          refreshToken: issued.refreshToken,
        })

        const actual = await RenewAccessTokenMutationResolver.create()
          .resolve({ context })

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
            adminId: 930003,
          },
        },
        {
          params: {
            adminId: 930004,
          },
        },
      ]

      test.each(cases)('adminId: $params.adminId', async ({ params }) => {
        const issued = await issueAdminSession(params)

        await RenewAccessTokenMutationResolver.create()
          .resolve({
            context: createContext({
              refreshToken: issued.refreshToken,
            }),
          })

        const spentRow = await AdminRefreshToken.findOne({
          where: {
            tokenHash: AdminRefreshToken.hashToken({
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
            adminId: 930005,
          },
        },
        {
          params: {
            adminId: 930006,
          },
        },
      ]

      test.each(cases)('adminId: $params.adminId', async ({ params }) => {
        const issued = await issueAdminSession(params)

        const actual = await RenewAccessTokenMutationResolver.create()
          .resolve({
            context: createContext({
              refreshToken: issued.refreshToken,
            }),
          })

        const renewedAccessToken = await AdminAccessToken.findOne({
          where: {
            accessToken: actual.accessToken,
          },
        })

        expect(renewedAccessToken)
          .toHaveProperty('sessionKey', issued.sessionKey)
      })
    })

    describe('should refuse a refresh token that was already exchanged', () => {
      const cases = [
        {
          params: {
            adminId: 930007,
          },
        },
        {
          params: {
            adminId: 930008,
          },
        },
      ]

      test.each(cases)('adminId: $params.adminId', async ({ params }) => {
        const issued = await issueAdminSession(params)

        await RenewAccessTokenMutationResolver.create()
          .resolve({
            context: createContext({
              refreshToken: issued.refreshToken,
            }),
          })

        const actual = () => RenewAccessTokenMutationResolver.create()
          .resolve({
            context: createContext({
              refreshToken: issued.refreshToken,
            }),
          })

        await expect(actual)
          .rejects
          .toThrow('205.M002.001')
      })
    })

    describe('should revoke the whole series when a token is reused', () => {
      const cases = [
        {
          params: {
            adminId: 930009,
          },
        },
        {
          params: {
            adminId: 930010,
          },
        },
      ]

      test.each(cases)('adminId: $params.adminId', async ({ params }) => {
        const issued = await issueAdminSession(params)

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
          .toThrow('205.M002.001')

        const survivingAccessToken = await AdminAccessToken.findOne({
          where: {
            accessToken: renewed.accessToken,
          },
        })

        expect(survivingAccessToken)
          .toBeNull()

        const seriesRows = await AdminRefreshToken.findAll({
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
          .toThrow('102.M002.001')

        expect(context.clearRefreshTokenCookie)
          .toHaveBeenCalledWith()
      })
    })

    describe('should refuse a refresh token past its expiry', () => {
      const cases = [
        {
          params: {
            adminId: 930011,
          },
        },
        {
          params: {
            adminId: 930012,
          },
        },
      ]

      test.each(cases)('adminId: $params.adminId', async ({ params }) => {
        const issued = await issueAdminSession(params)

        const row = await AdminRefreshToken.findOne({
          where: {
            tokenHash: AdminRefreshToken.hashToken({
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
          .toThrow('102.M002.001')

        // Expiry is not a leak, so the series is left alone.
        const seriesRows = await AdminRefreshToken.findAll({
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
