import SignOutMutationResolver from '../../../../../../../../server/graphql/resolvers/admin/actual/mutations/SignOutMutationResolver.js'
import SignInMutationResolver from '../../../../../../../../server/graphql/resolvers/admin/actual/mutations/SignInMutationResolver.js'

import AdminAccessToken from '../../../../../../../../sequelize/models/AdminAccessToken.js'
import AdminRefreshToken from '../../../../../../../../sequelize/models/AdminRefreshToken.js'

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
 * Issue a real admin session, so there is a series to revoke.
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

describe('SignOutMutationResolver', () => {
  describe('#resolve()', () => {
    describe('should end the session on the server', () => {
      const cases = [
        {
          params: {
            adminId: 940001,
          },
        },
        {
          params: {
            adminId: 940002,
          },
        },
      ]

      test.each(cases)('adminId: $params.adminId', async ({ params }) => {
        const issued = await issueAdminSession(params)

        const context = createContext({
          refreshToken: issued.refreshToken,
        })

        const actual = await SignOutMutationResolver.create()
          .resolve({ context })

        expect(actual)
          .toEqual({
            signedOut: true,
          })

        expect(context.clearRefreshTokenCookie)
          .toHaveBeenCalledWith()

        const revokedRow = await AdminRefreshToken.findOne({
          where: {
            tokenHash: AdminRefreshToken.hashToken({
              token: issued.refreshToken,
            }),
          },
        })

        expect(revokedRow.revokedAt)
          .not
          .toBeNull()

        const survivingAccessToken = await AdminAccessToken.findOne({
          where: {
            accessToken: issued.accessToken,
          },
        })

        expect(survivingAccessToken)
          .toBeNull()
      })
    })

    describe('should report success even when the cookie matches nothing', () => {
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

        const actual = await SignOutMutationResolver.create()
          .resolve({ context })

        expect(actual)
          .toEqual({
            signedOut: true,
          })

        expect(context.clearRefreshTokenCookie)
          .toHaveBeenCalledWith()
      })
    })
  })
})
