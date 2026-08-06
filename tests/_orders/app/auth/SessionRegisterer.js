import SessionRegisterer from '../../../../app/auth/SessionRegisterer.js'

import CustomerAccessToken from '../../../../sequelize/models/CustomerAccessToken.js'
import CustomerRefreshToken from '../../../../sequelize/models/CustomerRefreshToken.js'

describe('SessionRegisterer', () => {
  describe('#saveTokenPair()', () => {
    describe('should issue a token pair', () => {
      const cases = [
        {
          input: {
            customerId: 950001,
            sessionKey: 'clerk-session-key-950001',
            now: new Date('2026-08-01T00:00:01.001Z'),
          },
          expected: {
            accessToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
            refreshToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
            sessionKey: 'clerk-session-key-950001',
          },
        },
        {
          input: {
            customerId: 950002,
            sessionKey: 'clerk-session-key-950002',
            now: new Date('2026-08-02T00:00:02.002Z'),
          },
          expected: {
            accessToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
            refreshToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
            sessionKey: 'clerk-session-key-950002',
          },
        },
      ]

      test.each(cases)('customerId: $input.customerId', async ({
        input,
        expected,
      }) => {
        const registerer = SessionRegisterer.create({
          AccessTokenModel: CustomerAccessToken,
          RefreshTokenModel: CustomerRefreshToken,
        })
        const args = {
          customerId: input.customerId,
          sessionKey: input.sessionKey,
          now: input.now,
          transaction: null,
        }

        const received = await registerer.saveTokenPair(args)

        expect(received)
          .toEqual(expected)
      })
    })
  })
})

describe('SessionRegisterer', () => {
  describe('#saveSession()', () => {
    describe('should issue a token pair with a minted session key', () => {
      const cases = [
        {
          input: {
            customerId: 951001,
            now: new Date('2026-08-03T00:00:03.003Z'),
          },
          // The session key is minted, not supplied, so it matches the token format too.
          expected: {
            accessToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
            refreshToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
            sessionKey: expect.stringMatching(/^[0-9a-f]{64}$/u),
          },
        },
        {
          input: {
            customerId: 951002,
            now: new Date('2026-08-04T00:00:04.004Z'),
          },
          expected: {
            accessToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
            refreshToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
            sessionKey: expect.stringMatching(/^[0-9a-f]{64}$/u),
          },
        },
      ]

      test.each(cases)('customerId: $input.customerId', async ({
        input,
        expected,
      }) => {
        const registerer = SessionRegisterer.create({
          AccessTokenModel: CustomerAccessToken,
          RefreshTokenModel: CustomerRefreshToken,
        })
        const args = {
          customerId: input.customerId,
          now: input.now,
          transaction: null,
        }

        const received = await registerer.saveSession(args)

        expect(received)
          .toEqual(expected)
      })
    })
  })
})

describe('SessionRegisterer', () => {
  describe('#revokeRefreshTokensInSeries()', () => {
    describe('should flag every live refresh token in the series as revoked', () => {
      const cases = [
        {
          input: {
            sessionKey: 'clerk-session-key-954001',
            now: new Date('2026-08-09T06:00:09.009Z'),
            transaction: null,
          },
          expected: [
            {
              revokedAt: new Date('2026-08-09T06:00:09.009Z'),
            },
            {
              where: {
                sessionKey: 'clerk-session-key-954001',
                revokedAt: null,
              },
              transaction: null,
            },
          ],
        },
        {
          input: {
            sessionKey: 'clerk-session-key-954002',
            now: new Date('2026-08-10T06:00:10.010Z'),
            transaction: null,
          },
          expected: [
            {
              revokedAt: new Date('2026-08-10T06:00:10.010Z'),
            },
            {
              where: {
                sessionKey: 'clerk-session-key-954002',
                revokedAt: null,
              },
              transaction: null,
            },
          ],
        },
      ]

      test.each(cases)('sessionKey: $input.sessionKey', async ({
        input,
        expected,
      }) => {
        const updateSpy = jest.spyOn(CustomerRefreshToken, 'update')
        const registerer = SessionRegisterer.create({
          AccessTokenModel: CustomerAccessToken,
          RefreshTokenModel: CustomerRefreshToken,
        })
        const args = {
          sessionKey: input.sessionKey,
          now: input.now,
          transaction: input.transaction,
        }

        await registerer.revokeRefreshTokensInSeries(args)

        expect(updateSpy)
          .toHaveBeenCalledWith(...expected)
      })
    })
  })
})

describe('SessionRegisterer', () => {
  describe('#deleteAccessTokensInSeries()', () => {
    describe('should delete every access token in the series', () => {
      const cases = [
        {
          input: {
            sessionKey: 'clerk-session-key-955001',
            transaction: null,
          },
          expected: [
            {
              where: {
                sessionKey: 'clerk-session-key-955001',
              },
              transaction: null,
            },
          ],
        },
        {
          input: {
            sessionKey: 'clerk-session-key-955002',
            transaction: null,
          },
          expected: [
            {
              where: {
                sessionKey: 'clerk-session-key-955002',
              },
              transaction: null,
            },
          ],
        },
      ]

      test.each(cases)('sessionKey: $input.sessionKey', async ({
        input,
        expected,
      }) => {
        const destroySpy = jest.spyOn(CustomerAccessToken, 'destroy')
        const registerer = SessionRegisterer.create({
          AccessTokenModel: CustomerAccessToken,
          RefreshTokenModel: CustomerRefreshToken,
        })
        const args = {
          sessionKey: input.sessionKey,
          transaction: input.transaction,
        }

        await registerer.deleteAccessTokensInSeries(args)

        expect(destroySpy)
          .toHaveBeenCalledWith(...expected)
      })
    })
  })
})

describe('SessionRegisterer', () => {
  describe('#consumeRefreshToken()', () => {
    describe('should mark the presented refresh token used', () => {
      const cases = [
        {
          input: {
            presentedRefreshToken: 'refresh-token-12-01', // seeded: active
            now: new Date('2026-08-07T06:00:07.007Z'),
          },
          expected: new Date('2026-08-07T06:00:07.007Z'),
        },
        {
          input: {
            presentedRefreshToken: 'refresh-token-13-01', // seeded: active
            now: new Date('2026-08-08T06:00:08.008Z'),
          },
          expected: new Date('2026-08-08T06:00:08.008Z'),
        },
      ]

      test.each(cases)('presentedRefreshToken: $input.presentedRefreshToken', async ({
        input,
        expected,
      }) => {
        const registerer = SessionRegisterer.create({
          AccessTokenModel: CustomerAccessToken,
          RefreshTokenModel: CustomerRefreshToken,
        })
        const refreshTokenEntity = await registerer.findRefreshTokenEntity({
          presentedRefreshToken: input.presentedRefreshToken,
        })
        const args = {
          refreshTokenEntity,
          now: input.now,
          transaction: null,
        }

        await registerer.consumeRefreshToken(args)

        const received = refreshTokenEntity.usedAt

        expect(received)
          .toEqual(expected)
      })
    })
  })
})

describe('SessionRegisterer', () => {
  describe('#revokeSeries()', () => {
    describe('should revoke the refresh tokens then delete the access tokens of the series', () => {
      const cases = [
        {
          input: {
            sessionKey: 'clerk-session-key-956001',
            now: new Date('2026-08-13T06:00:13.013Z'),
            transaction: null,
          },
          expected: {
            revokeRefreshTokensInSeries: {
              sessionKey: 'clerk-session-key-956001',
              now: new Date('2026-08-13T06:00:13.013Z'),
              transaction: null,
            },
            deleteAccessTokensInSeries: {
              sessionKey: 'clerk-session-key-956001',
              transaction: null,
            },
          },
        },
        {
          input: {
            sessionKey: 'clerk-session-key-956002',
            now: new Date('2026-08-14T06:00:14.014Z'),
            transaction: null,
          },
          expected: {
            revokeRefreshTokensInSeries: {
              sessionKey: 'clerk-session-key-956002',
              now: new Date('2026-08-14T06:00:14.014Z'),
              transaction: null,
            },
            deleteAccessTokensInSeries: {
              sessionKey: 'clerk-session-key-956002',
              transaction: null,
            },
          },
        },
      ]

      test.each(cases)('sessionKey: $input.sessionKey', async ({
        input,
        expected,
      }) => {
        const registerer = SessionRegisterer.create({
          AccessTokenModel: CustomerAccessToken,
          RefreshTokenModel: CustomerRefreshToken,
        })
        const revokeRefreshTokensInSeriesSpy = jest.spyOn(registerer, 'revokeRefreshTokensInSeries')
          .mockResolvedValue()
        const deleteAccessTokensInSeriesSpy = jest.spyOn(registerer, 'deleteAccessTokensInSeries')
          .mockResolvedValue()
        const args = {
          sessionKey: input.sessionKey,
          now: input.now,
          transaction: input.transaction,
        }

        await registerer.revokeSeries(args)

        expect(revokeRefreshTokensInSeriesSpy)
          .toHaveBeenCalledWith(expected.revokeRefreshTokensInSeries)
        expect(deleteAccessTokensInSeriesSpy)
          .toHaveBeenCalledWith(expected.deleteAccessTokensInSeries)
      })
    })
  })
})
