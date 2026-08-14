import RenewAccessTokenMutationResolver from '../../../../../../../../server/graphql/resolvers/admin/actual/mutations/RenewAccessTokenMutationResolver.js'

import SessionClerk from '../../../../../../../../app/session/SessionClerk.js'
import SavingSessionResult from '../../../../../../../../app/session/SavingSessionResult.js'
import RevokingSessionResult from '../../../../../../../../app/session/RevokingSessionResult.js'
import RefreshTokenExpressCookieClerk from '../../../../../../../../server/graphql/contexts/tools/RefreshTokenExpressCookieClerk.js'

import AdminRefreshToken from '../../../../../../../../sequelize/models/AdminRefreshToken.js'

describe('RenewAccessTokenMutationResolver', () => {
  describe('#resolve()', () => {
    const resolver = RenewAccessTokenMutationResolver.create()

    describe('should renew the access token from a valid refresh cookie', () => {
      const cases = [
        {
          mockPresentedRefreshToken: 'refresh-token-04-01', // seeded: active
          params: {
            context: /** @type {*} */ ({
              now: new Date('2026-08-04T05:00:04.004Z'),
            }),
          },
          expected: {
            accessToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
          },
        },
        {
          mockPresentedRefreshToken: 'refresh-token-05-01', // seeded: active
          params: {
            context: /** @type {*} */ ({
              now: new Date('2026-08-05T05:00:05.005Z'),
            }),
          },
          expected: {
            accessToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
          },
        },
      ]

      test.each(cases)('now: $params.context.now', async ({
        mockPresentedRefreshToken,
        params,
        expected,
      }) => {
        jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'extractRefreshToken')
          .mockReturnValue(mockPresentedRefreshToken)

        const received = await resolver.resolve(params)

        expect(received)
          .toEqual(expected)
      })
    })

    describe('should hand a new refresh token to the browser as a cookie', () => {
      const cases = [
        {
          mockPresentedRefreshToken: 'refresh-token-06-01', // seeded: active
          params: {
            context: /** @type {*} */ ({
              now: new Date('2026-08-06T05:00:06.006Z'),
            }),
          },
          expected: {
            refreshToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
          },
        },
        {
          mockPresentedRefreshToken: 'refresh-token-07-01', // seeded: active
          params: {
            context: /** @type {*} */ ({
              now: new Date('2026-08-07T05:00:07.007Z'),
            }),
          },
          expected: {
            refreshToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
          },
        },
      ]

      test.each(cases)('now: $params.context.now', async ({
        mockPresentedRefreshToken,
        params,
        expected,
      }) => {
        jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'extractRefreshToken')
          .mockReturnValue(mockPresentedRefreshToken)
        const saveRefreshTokenCookieSpy = jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'saveRefreshTokenCookie')

        await resolver.resolve(params)

        expect(saveRefreshTokenCookieSpy)
          .toHaveBeenCalledWith(expected)
      })
    })

    describe('should refuse a refresh token that was already exchanged', () => {
      const cases = [
        {
          mockPresentedRefreshToken: 'refresh-token-02-01', // seeded: used
          params: {
            context: /** @type {*} */ ({
              now: new Date('2026-08-02T05:00:02.002Z'),
            }),
          },
        },
        {
          mockPresentedRefreshToken: 'refresh-token-14-01', // seeded: used
          params: {
            context: /** @type {*} */ ({
              now: new Date('2026-08-14T05:00:14.014Z'),
            }),
          },
        },
      ]

      test.each(cases)('now: $params.context.now', async ({
        mockPresentedRefreshToken,
        params,
      }) => {
        jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'extractRefreshToken')
          .mockReturnValue(mockPresentedRefreshToken)
        const clearRefreshTokenCookieSpy = jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'clearRefreshTokenCookie')

        const actual = () => resolver.resolve(params)

        await expect(actual)
          .rejects
          .toThrow('205.M005.001')
        expect(clearRefreshTokenCookieSpy)
          .toHaveBeenCalledWith()
      })
    })

    describe('should reject when rotating the session fails', () => {
      const cases = [
        {
          mockPresentedRefreshToken: 'refresh-token-08-01', // seeded: active
          params: {
            context: /** @type {*} */ ({
              now: new Date('2026-08-08T05:00:08.008Z'),
            }),
          },
        },
        {
          mockPresentedRefreshToken: 'refresh-token-09-01', // seeded: active
          params: {
            context: /** @type {*} */ ({
              now: new Date('2026-08-09T05:00:09.009Z'),
            }),
          },
        },
      ]

      test.each(cases)('now: $params.context.now', async ({
        mockPresentedRefreshToken,
        params,
      }) => {
        jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'extractRefreshToken')
          .mockReturnValue(mockPresentedRefreshToken)
        jest.spyOn(SessionClerk.prototype, 'rotateSession')
          .mockResolvedValue(SavingSessionResult.create({
            error: new Error('Failed to rotate the session'),
          }))

        const actual = () => resolver.resolve(params)

        await expect(actual)
          .rejects
          .toThrow('Failed to rotate the session')
      })
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#handleReusedToken()', () => {
    describe('should clear the cookie and report the reuse', () => {
      const resolver = RenewAccessTokenMutationResolver.create()

      const cases = [
        {
          // No live rows on this series — the reuse response still runs revoke (a real no-op here),
          // clears the cookie, and throws. The real revoke effect is asserted in #revokeReusedSession().
          params: {
            sessionKey: 'session-key-960001',
            now: new Date('2026-08-22T06:00:22.022Z'),
          },
        },
        {
          params: {
            sessionKey: 'session-key-960002',
            now: new Date('2026-08-23T06:00:23.023Z'),
          },
        },
      ]

      test.each(cases)('sessionKey: $params.sessionKey', async ({ params }) => {
        const clearRefreshTokenCookieSpy = jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'clearRefreshTokenCookie')
        const refreshTokenEntity = /** @type {*} */ (
          AdminRefreshToken.build({
            sessionKey: params.sessionKey,
          })
        )
        const context = /** @type {*} */ ({
          now: params.now,
        })

        const actual = () => resolver.handleReusedToken({
          context,
          refreshTokenEntity,
        })

        await expect(actual)
          .rejects
          .toThrow('205.M005.001')
        expect(clearRefreshTokenCookieSpy)
          .toHaveBeenCalledWith()
      })
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#revokeReusedSession()', () => {
    describe('should revoke the whole session of the presented token', () => {
      const resolver = RenewAccessTokenMutationResolver.create()

      const cases = [
        {
          params: {
            sessionKey: 'session-key-96-01', // seeded: 2 live (+1 revoked) refresh, 3 access
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
          params: {
            sessionKey: 'session-key-97-01', // seeded: 1 live refresh, 2 access
            now: new Date('2026-08-25T06:00:25.025Z'),
          },
          expected: RevokingSessionResult.create({
            response: {
              revokedRefreshTokenCount: 1,
              deletedAccessTokenCount: 2,
            },
          }),
        },
      ]

      test.each(cases)('sessionKey: $params.sessionKey', async ({
        params,
        expected,
      }) => {
        const refreshTokenEntity = /** @type {*} */ (
          AdminRefreshToken.build({
            sessionKey: params.sessionKey,
          })
        )
        const context = /** @type {*} */ ({
          now: params.now,
        })

        const received = await resolver.revokeReusedSession({
          context,
          refreshTokenEntity,
        })

        expect(received)
          .toEqual(expected)
        expect(received)
          .toBeInstanceOf(RevokingSessionResult)
      })
    })
  })
})
