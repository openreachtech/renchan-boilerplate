import SignOutMutationResolver from '../../../../../../../../server/graphql/resolvers/admin/actual/mutations/SignOutMutationResolver.js'

import SessionClerk from '../../../../../../../../app/session/SessionClerk.js'
import RevokingSessionResult from '../../../../../../../../app/session/RevokingSessionResult.js'
import RefreshTokenExpressCookieClerk from '../../../../../../../../server/graphql/contexts/tools/RefreshTokenExpressCookieClerk.js'

import AdminRefreshToken from '../../../../../../../../sequelize/models/AdminRefreshToken.js'

describe('SignOutMutationResolver', () => {
  describe('#resolve()', () => {
    const resolver = SignOutMutationResolver.create()

    describe('should revoke the series and clear the cookie', () => {
      const cases = [
        {
          input: {
            presentedRefreshToken: 'refresh-token-10-01', // seeded: active
            now: new Date('2026-08-10T05:00:10.010Z'),
          },
          expected: {
            isSignedOut: true,
          },
        },
        {
          input: {
            presentedRefreshToken: 'refresh-token-11-01', // seeded: active
            now: new Date('2026-08-11T05:00:11.011Z'),
          },
          expected: {
            isSignedOut: true,
          },
        },
      ]

      test.each(cases)('presentedRefreshToken: $input.presentedRefreshToken', async ({
        input,
        expected,
      }) => {
        jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'extractRefreshToken')
          .mockReturnValue(input.presentedRefreshToken)
        const clearRefreshTokenCookieSpy = jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'clearRefreshTokenCookie')
        const args = {
          context: /** @type {*} */ ({
            now: input.now,
          }),
        }

        const received = await resolver.resolve(args)

        expect(received)
          .toEqual(expected)
        expect(clearRefreshTokenCookieSpy)
          .toHaveBeenCalledWith()
      })
    })

    describe('should stay idempotent when the cookie matches nothing', () => {
      const cases = [
        {
          input: {
            presentedRefreshToken: null, // no cookie presented
            now: new Date('2026-08-20T05:00:20.020Z'),
          },
          expected: {
            isSignedOut: true,
          },
        },
        {
          input: {
            presentedRefreshToken: 'unmatched-refresh-token-value-0021', // matches no seeded row
            now: new Date('2026-08-21T05:00:21.021Z'),
          },
          expected: {
            isSignedOut: true,
          },
        },
      ]

      test.each(cases)('presentedRefreshToken: $input.presentedRefreshToken', async ({
        input,
        expected,
      }) => {
        jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'extractRefreshToken')
          .mockReturnValue(input.presentedRefreshToken)
        const clearRefreshTokenCookieSpy = jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'clearRefreshTokenCookie')
        const args = {
          context: /** @type {*} */ ({
            now: input.now,
          }),
        }

        const received = await resolver.resolve(args)

        expect(received)
          .toEqual(expected)
        expect(clearRefreshTokenCookieSpy)
          .toHaveBeenCalledWith()
      })
    })

    describe('should reject when revoking the session fails', () => {
      const cases = [
        {
          input: {
            presentedRefreshToken: 'refresh-token-12-01', // seeded: active
            now: new Date('2026-08-12T05:00:12.012Z'),
          },
        },
        {
          input: {
            presentedRefreshToken: 'refresh-token-13-01', // seeded: active
            now: new Date('2026-08-13T05:00:13.013Z'),
          },
        },
      ]

      test.each(cases)('presentedRefreshToken: $input.presentedRefreshToken', async ({ input }) => {
        jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'extractRefreshToken')
          .mockReturnValue(input.presentedRefreshToken)
        jest.spyOn(SessionClerk.prototype, 'revokeSession')
          .mockResolvedValue(RevokingSessionResult.create({
            error: new Error('Failed to revoke the session'),
          }))
        const args = {
          context: /** @type {*} */ ({
            now: input.now,
          }),
        }

        const actual = () => resolver.resolve(args)

        await expect(actual)
          .rejects
          .toThrow('Failed to revoke the session')
      })
    })
  })
})

describe('SignOutMutationResolver', () => {
  describe('#revokeSeries()', () => {
    describe('should revoke the whole series of the presented token', () => {
      const resolver = SignOutMutationResolver.create()

      const cases = [
        {
          input: {
            sessionKey: 'session-key-98-01', // seeded: 2 live (+1 revoked) refresh, 3 access
            now: new Date('2026-08-24T06:00:24.024Z'),
          },
          expected: RevokingSessionResult.create({
            response: {
              revokedRefreshTokenCount: 2,
              deletedAccessTokenCount: 3,
            },
          }),
        },
        {
          input: {
            sessionKey: 'session-key-99-01', // seeded: 1 live refresh, 1 access
            now: new Date('2026-08-25T06:00:25.025Z'),
          },
          expected: RevokingSessionResult.create({
            response: {
              revokedRefreshTokenCount: 1,
              deletedAccessTokenCount: 1,
            },
          }),
        },
      ]

      test.each(cases)('sessionKey: $input.sessionKey', async ({
        input,
        expected,
      }) => {
        const refreshTokenEntity = /** @type {*} */ (
          AdminRefreshToken.build({
            sessionKey: input.sessionKey,
          })
        )
        const args = {
          context: /** @type {*} */ ({
            now: input.now,
          }),
          refreshTokenEntity,
        }

        const received = await resolver.revokeSeries(args)

        expect(received)
          .toEqual(expected)
        expect(received)
          .toBeInstanceOf(RevokingSessionResult)
      })
    })
  })
})
