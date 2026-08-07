import RenewAccessTokenMutationResolver from '../../../../../../../../server/graphql/resolvers/customer/actual/mutations/RenewAccessTokenMutationResolver.js'

import RefreshTokenExpressCookieClerk from '../../../../../../../../server/graphql/contexts/tools/RefreshTokenExpressCookieClerk.js'

import CustomerAccessToken from '../../../../../../../../sequelize/models/CustomerAccessToken.js'
import CustomerRefreshToken from '../../../../../../../../sequelize/models/CustomerRefreshToken.js'

describe('RenewAccessTokenMutationResolver', () => {
  describe('#resolve()', () => {
    describe('should renew the access token from a valid refresh cookie', () => {
      const cases = [
        {
          input: {
            presentedRefreshToken: 'refresh-token-04-01', // seeded: active
            now: new Date('2026-08-04T05:00:04.004Z'),
          },
          expected: {
            accessToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
          },
        },
        {
          input: {
            presentedRefreshToken: 'refresh-token-05-01', // seeded: active
            now: new Date('2026-08-05T05:00:05.005Z'),
          },
          expected: {
            accessToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
          },
        },
      ]

      test.each(cases)('presentedRefreshToken: $input.presentedRefreshToken', async ({
        input,
        expected,
      }) => {
        jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'extractRefreshToken')
          .mockReturnValue(input.presentedRefreshToken)

        jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'saveRefreshTokenCookie')

        const resolver = RenewAccessTokenMutationResolver.create()
        const args = {
          context: /** @type {*} */ ({
            now: input.now,
          }),
        }

        const received = await resolver.resolve(args)

        expect(received)
          .toEqual(expected)
      })
    })

    describe('should hand a new refresh token to the browser as a cookie', () => {
      const cases = [
        {
          input: {
            presentedRefreshToken: 'refresh-token-06-01', // seeded: active
            now: new Date('2026-08-06T05:00:06.006Z'),
          },
          expected: {
            refreshToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
          },
        },
        {
          input: {
            presentedRefreshToken: 'refresh-token-07-01', // seeded: active
            now: new Date('2026-08-07T05:00:07.007Z'),
          },
          expected: {
            refreshToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
          },
        },
      ]

      test.each(cases)('presentedRefreshToken: $input.presentedRefreshToken', async ({
        input,
        expected,
      }) => {
        jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'extractRefreshToken')
          .mockReturnValue(input.presentedRefreshToken)
        const saveRefreshTokenCookieSpy = jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'saveRefreshTokenCookie')
        const resolver = RenewAccessTokenMutationResolver.create()
        const args = {
          context: /** @type {*} */ ({
            now: input.now,
          }),
        }

        await resolver.resolve(args)

        expect(saveRefreshTokenCookieSpy)
          .toHaveBeenCalledWith(expected)
      })
    })

    describe('should refuse a refresh token that was already exchanged', () => {
      const cases = [
        {
          input: {
            presentedRefreshToken: 'refresh-token-02-01', // seeded: used
            now: new Date('2026-08-02T05:00:02.002Z'),
          },
        },
        {
          input: {
            presentedRefreshToken: 'refresh-token-14-01', // seeded: used
            now: new Date('2026-08-14T05:00:14.014Z'),
          },
        },
      ]

      test.each(cases)('presentedRefreshToken: $input.presentedRefreshToken', async ({ input }) => {
        jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'extractRefreshToken')
          .mockReturnValue(input.presentedRefreshToken)
        const clearRefreshTokenCookieSpy = jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'clearRefreshTokenCookie')
        const resolver = RenewAccessTokenMutationResolver.create()
        const args = {
          context: /** @type {*} */ ({
            now: input.now,
          }),
        }

        const actual = () => resolver.resolve(args)

        await expect(actual)
          .rejects
          .toThrow('205.M003.001')
        expect(clearRefreshTokenCookieSpy)
          .toHaveBeenCalledWith()
      })
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#handleReusedToken()', () => {
    describe('should clear the cookie and report the reuse', () => {
      const cases = [
        {
          // No live rows on this series — the reuse response still runs revoke (a real no-op here),
          // clears the cookie, and throws. The real revoke effect is asserted in #revokeReusedSession().
          input: {
            sessionKey: 'session-key-960001',
            now: new Date('2026-08-22T06:00:22.022Z'),
          },
        },
        {
          input: {
            sessionKey: 'session-key-960002',
            now: new Date('2026-08-23T06:00:23.023Z'),
          },
        },
      ]

      test.each(cases)('sessionKey: $input.sessionKey', async ({ input }) => {
        const clearRefreshTokenCookieSpy = jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'clearRefreshTokenCookie')
        const resolver = RenewAccessTokenMutationResolver.create()
        const args = {
          context: /** @type {*} */ ({
            now: input.now,
          }),
          refreshTokenEntity: /** @type {*} */ (
            CustomerRefreshToken.build({
              sessionKey: input.sessionKey,
            })
          ),
        }

        const actual = () => resolver.handleReusedToken(args)

        await expect(actual)
          .rejects
          .toThrow('205.M003.001')
        expect(clearRefreshTokenCookieSpy)
          .toHaveBeenCalledWith()
      })
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#revokeReusedSession()', () => {
    describe('should revoke the whole series of the presented token', () => {
      const cases = [
        {
          input: {
            sessionKey: 'session-key-96-01', // seeded: 2 live (+1 revoked) refresh, 3 access
            now: new Date('2026-08-24T06:00:24.024Z'),
          },
          expected: {
            revokedRefreshTokenCount: 2,
            deletedAccessTokenCount: 3,
          },
        },
        {
          input: {
            sessionKey: 'session-key-97-01', // seeded: 1 live refresh, 2 access
            now: new Date('2026-08-25T06:00:25.025Z'),
          },
          expected: {
            revokedRefreshTokenCount: 1,
            deletedAccessTokenCount: 2,
          },
        },
      ]

      test.each(cases)('sessionKey: $input.sessionKey', async ({
        input,
        expected,
      }) => {
        const resolver = RenewAccessTokenMutationResolver.create()
        const args = {
          context: /** @type {*} */ ({
            now: input.now,
          }),
          refreshTokenEntity: /** @type {*} */ (
            CustomerRefreshToken.build({
              sessionKey: input.sessionKey,
            })
          ),
        }

        const received = await resolver.revokeReusedSession(args)

        expect(received)
          .toEqual(expected)
      })
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#rotateSession()', () => {
    describe('should issue the next pair in the same series', () => {
      const cases = [
        {
          input: {
            customerId: 953001,
            sessionKey: 'clerk-session-key-953001',
            refreshToken: 'rotate-refresh-token-953001',
            generatedAt: new Date('2026-08-10T00:00:10.010Z'),
            now: new Date('2026-08-10T06:00:10.010Z'),
          },
          expected: 'clerk-session-key-953001',
        },
        {
          input: {
            customerId: 953002,
            sessionKey: 'clerk-session-key-953002',
            refreshToken: 'rotate-refresh-token-953002',
            generatedAt: new Date('2026-08-11T00:00:11.011Z'),
            now: new Date('2026-08-11T06:00:11.011Z'),
          },
          expected: 'clerk-session-key-953002',
        },
      ]

      test.each(cases)('sessionKey: $input.sessionKey', async ({
        input,
        expected,
      }) => {
        const refreshTokenEntity = CustomerRefreshToken.buildWithGeneratedAttributes({
          customerId: input.customerId,
          sessionKey: input.sessionKey,
          refreshToken: input.refreshToken,
          generatedAt: input.generatedAt,
        })
        const resolver = RenewAccessTokenMutationResolver.create()
        const args = {
          context: /** @type {*} */ ({
            now: input.now,
          }),
          refreshTokenEntity,
        }

        const received = await resolver.rotateSession(args)

        expect(received.refreshTokenEntity.sessionKey)
          .toBe(expected)
      })
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#generateTransactionCallback()', () => {
    describe('the callback issues the next pair in the same series', () => {
      const cases = [
        {
          input: {
            customerId: 953003,
            sessionKey: 'clerk-session-key-953003',
            refreshToken: 'rotate-refresh-token-953003',
            generatedAt: new Date('2026-08-08T00:00:08.008Z'),
            now: new Date('2026-08-08T06:00:08.008Z'),
          },
          expected: 'clerk-session-key-953003',
        },
        {
          input: {
            customerId: 953004,
            sessionKey: 'clerk-session-key-953004',
            refreshToken: 'rotate-refresh-token-953004',
            generatedAt: new Date('2026-08-09T00:00:09.009Z'),
            now: new Date('2026-08-09T06:00:09.009Z'),
          },
          expected: 'clerk-session-key-953004',
        },
      ]

      test.each(cases)('sessionKey: $input.sessionKey', async ({
        input,
        expected,
      }) => {
        const refreshTokenEntity = CustomerRefreshToken.buildWithGeneratedAttributes({
          customerId: input.customerId,
          sessionKey: input.sessionKey,
          refreshToken: input.refreshToken,
          generatedAt: input.generatedAt,
        })
        const resolver = RenewAccessTokenMutationResolver.create()
        const args = {
          refreshTokenEntity,
          now: input.now,
        }

        const received = await CustomerAccessToken.beginTransaction(
          resolver.generateTransactionCallback(args)
        )

        expect(received.refreshTokenEntity.sessionKey)
          .toBe(expected)
      })
    })
  })
})
