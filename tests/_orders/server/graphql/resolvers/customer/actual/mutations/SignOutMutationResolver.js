import SignOutMutationResolver from '../../../../../../../../server/graphql/resolvers/customer/actual/mutations/SignOutMutationResolver.js'
import SignInMutationResolver from '../../../../../../../../server/graphql/resolvers/customer/actual/mutations/SignInMutationResolver.js'

import CustomerAccessToken from '../../../../../../../../sequelize/models/CustomerAccessToken.js'
import CustomerRefreshToken from '../../../../../../../../sequelize/models/CustomerRefreshToken.js'

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
 * Sign an account in, so there is a real series to revoke.
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

describe('SignOutMutationResolver', () => {
  describe('#resolve()', () => {
    describe('should end the session on the server', () => {
      const cases = [
        {
          params: {
            customerId: 920001,
          },
        },
        {
          params: {
            customerId: 920002,
          },
        },
      ]

      test.each(cases)('customerId: $params.customerId', async ({ params }) => {
        const issued = await issueSession(params)

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

        // The whole series is revoked, and the access tokens it handed out are deleted, so a token
        // copied off a shared terminal stops working the moment its holder signs out.
        const revokedRow = await CustomerRefreshToken.findOne({
          where: {
            tokenHash: CustomerRefreshToken.hashToken({
              token: issued.refreshToken,
            }),
          },
        })

        expect(revokedRow.revokedAt)
          .not
          .toBeNull()

        const survivingAccessToken = await CustomerAccessToken.findOne({
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
