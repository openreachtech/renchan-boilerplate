import SignOutMutationResolver from '../../../../../../../../server/graphql/resolvers/customer/actual/mutations/SignOutMutationResolver.js'

import SessionClerk from '../../../../../../../../app/session/SessionClerk.js'
import RevokingSessionResult from '../../../../../../../../app/session/RevokingSessionResult.js'
import RefreshTokenExpressCookieClerk from '../../../../../../../../server/graphql/contexts/tools/RefreshTokenExpressCookieClerk.js'

import CustomerRefreshToken from '../../../../../../../../sequelize/models/CustomerRefreshToken.js'

describe('SignOutMutationResolver', () => {
  describe('#resolve()', () => {
    const resolver = SignOutMutationResolver.create()

    describe('should report signed out for a valid cookie', () => {
      const cases = [
        {
          mockRefreshToken: 'refresh-token-99-01', // seeded: active, dedicated to sign-out
          params: {
            context: /** @type {*} */ ({
              now: new Date('2026-09-09T05:00:09.009Z'),
            }),
          },
          expected: {
            isSignedOut: true,
          },
        },
        {
          mockRefreshToken: 'refresh-token-99-02', // seeded: active, dedicated to sign-out
          params: {
            context: /** @type {*} */ ({
              now: new Date('2026-09-10T05:00:10.010Z'),
            }),
          },
          expected: {
            isSignedOut: true,
          },
        },
      ]

      test.each(cases)('mockRefreshToken: $mockRefreshToken', async ({
        mockRefreshToken,
        params,
        expected,
      }) => {
        jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'extractRefreshToken')
          .mockReturnValue(mockRefreshToken)

        const received = await resolver.resolve(params)

        expect(received)
          .toEqual(expected)
      })
    })

    describe('should clear the refresh cookie', () => {
      const cases = [
        {
          mockRefreshToken: 'refresh-token-99-01', // seeded: active, dedicated to sign-out
          params: {
            context: /** @type {*} */ ({
              now: new Date('2026-09-11T05:00:11.011Z'),
            }),
          },
        },
        {
          mockRefreshToken: 'refresh-token-99-02', // seeded: active, dedicated to sign-out
          params: {
            context: /** @type {*} */ ({
              now: new Date('2026-09-12T05:00:12.012Z'),
            }),
          },
        },
      ]

      test.each(cases)('mockRefreshToken: $mockRefreshToken', async ({
        mockRefreshToken,
        params,
      }) => {
        jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'extractRefreshToken')
          .mockReturnValue(mockRefreshToken)
        const clearRefreshTokenCookieSpy = jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'clearRefreshTokenCookie')

        await resolver.resolve(params)

        expect(clearRefreshTokenCookieSpy)
          .toHaveBeenCalledWith()
      })
    })

    describe('should reject when revoking the series fails', () => {
      const cases = [
        {
          mockRefreshToken: 'refresh-token-04-01', // seeded: active
          params: {
            context: /** @type {*} */ ({
              now: new Date('2026-09-13T05:00:13.013Z'),
            }),
          },
        },
        {
          mockRefreshToken: 'refresh-token-05-01', // seeded: active
          params: {
            context: /** @type {*} */ ({
              now: new Date('2026-09-14T05:00:14.014Z'),
            }),
          },
        },
      ]

      test.each(cases)('mockRefreshToken: $mockRefreshToken', async ({
        mockRefreshToken,
        params,
      }) => {
        jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'extractRefreshToken')
          .mockReturnValue(mockRefreshToken)
        jest.spyOn(SessionClerk.prototype, 'revokeSession')
          .mockResolvedValue(RevokingSessionResult.create({
            error: new Error('Failed to revoke the session'),
          }))

        const actual = () => resolver.resolve(params)

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
          params: {
            sessionKey: 'session-key-98-01', // seeded: 2 live (+1 revoked) refresh, 3 access
            now: new Date('2026-09-15T06:00:15.015Z'),
          },
          expected: RevokingSessionResult.create({
            response: {
              revokedRefreshTokenCount: 2,
              deletedAccessTokenCount: 3,
            },
          }),
        },
      ]

      test.each(cases)('sessionKey: $params.sessionKey', async ({
        params,
        expected,
      }) => {
        const args = {
          context: /** @type {*} */ ({
            now: params.now,
          }),
          refreshTokenEntity: /** @type {*} */ (
            CustomerRefreshToken.build({
              sessionKey: params.sessionKey,
            })
          ),
        }

        const received = await resolver.revokeSeries(args)

        expect(received)
          .toEqual(expected)
      })
    })
  })
})
