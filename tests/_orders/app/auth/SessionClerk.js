import SessionClerk from '../../../../app/auth/SessionClerk.js'

import CustomerAccessToken from '../../../../sequelize/models/CustomerAccessToken.js'
import CustomerRefreshToken from '../../../../sequelize/models/CustomerRefreshToken.js'

describe('SessionClerk', () => {
  describe('#saveSession()', () => {
    describe('should issue a token pair for an existing series', () => {
      const clerk = SessionClerk.create({
        AccessTokenModel: CustomerAccessToken,
        RefreshTokenModel: CustomerRefreshToken,
      })

      const cases = [
        {
          input: {
            customerId: 950001,
            sessionKey: 'clerk-session-key-950001',
            now: new Date('2026-08-01T00:00:01.001Z'),
          },
          expected: {
            accessTokenEntity: expect.any(CustomerAccessToken),
            refreshTokenEntity: expect.any(CustomerRefreshToken),
            refreshToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
          },
        },
        {
          input: {
            customerId: 950002,
            sessionKey: 'clerk-session-key-950002',
            now: new Date('2026-08-02T00:00:02.002Z'),
          },
          expected: {
            accessTokenEntity: expect.any(CustomerAccessToken),
            refreshTokenEntity: expect.any(CustomerRefreshToken),
            refreshToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
          },
        },
      ]

      test.each(cases)('customerId: $input.customerId', async ({
        input,
        expected,
      }) => {
        const args = {
          customerId: input.customerId,
          sessionKey: input.sessionKey,
          now: input.now,
          transaction: null,
        }

        const received = await clerk.saveSession(args)

        expect(received)
          .toEqual(expected)
      })
    })

    describe('should issue a token pair with a minted session key', () => {
      const clerk = SessionClerk.create({
        AccessTokenModel: CustomerAccessToken,
        RefreshTokenModel: CustomerRefreshToken,
      })

      const cases = [
        {
          input: {
            customerId: 951001,
            now: new Date('2026-08-03T00:00:03.003Z'),
          },
          expected: {
            accessTokenEntity: expect.any(CustomerAccessToken),
            refreshTokenEntity: expect.any(CustomerRefreshToken),
            refreshToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
          },
        },
        {
          input: {
            customerId: 951002,
            now: new Date('2026-08-04T00:00:04.004Z'),
          },
          expected: {
            accessTokenEntity: expect.any(CustomerAccessToken),
            refreshTokenEntity: expect.any(CustomerRefreshToken),
            refreshToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
          },
        },
      ]

      test.each(cases)('customerId: $input.customerId', async ({
        input,
        expected,
      }) => {
        const args = {
          customerId: input.customerId,
          now: input.now,
          transaction: null,
        }

        const received = await clerk.saveSession(args)

        expect(received)
          .toEqual(expected)
      })
    })
  })
})

describe('SessionClerk', () => {
  describe('#spendRefreshToken()', () => {
    describe('should mark the given refresh token used', () => {
      const clerk = SessionClerk.create({
        AccessTokenModel: CustomerAccessToken,
        RefreshTokenModel: CustomerRefreshToken,
      })

      const cases = [
        {
          input: {
            customerId: 952001,
            sessionKey: 'clerk-session-key-952001',
            refreshToken: 'spend-refresh-token-952001',
            generatedAt: new Date('2024-09-07T00:00:07.007Z'),
            now: new Date('2026-08-07T06:00:07.007Z'),
          },
          expected: [1],
        },
        {
          input: {
            customerId: 952002,
            sessionKey: 'clerk-session-key-952002',
            refreshToken: 'spend-refresh-token-952002',
            generatedAt: new Date('2024-09-08T00:00:08.008Z'),
            now: new Date('2026-08-08T06:00:08.008Z'),
          },
          expected: [1],
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
        await refreshTokenEntity.save()
        const args = {
          tokenHash: refreshTokenEntity.tokenHash,
          now: input.now,
          transaction: null,
        }

        const received = await clerk.spendRefreshToken(args)

        expect(received)
          .toEqual(expected)
      })
    })
  })
})

describe('SessionClerk', () => {
  describe('#revokeAllRefreshTokens()', () => {
    describe('should revoke only the live refresh tokens of the session', () => {
      const clerk = SessionClerk.create({
        AccessTokenModel: CustomerAccessToken,
        RefreshTokenModel: CustomerRefreshToken,
      })

      const cases = [
        {
          input: {
            sessionKey: 'session-key-90-01', // seeded: 2 live + 1 already revoked
            now: new Date('2026-08-09T06:00:09.009Z'),
            transaction: null,
          },
          expected: [2],
        },
        {
          input: {
            sessionKey: 'session-key-93-01', // seeded: 1 live
            now: new Date('2026-08-10T06:00:10.010Z'),
            transaction: null,
          },
          expected: [1],
        },
      ]

      test.each(cases)('sessionKey: $input.sessionKey', async ({
        input,
        expected,
      }) => {
        const args = {
          sessionKey: input.sessionKey,
          now: input.now,
          transaction: input.transaction,
        }

        const received = await clerk.revokeAllRefreshTokens(args)

        expect(received)
          .toEqual(expected)
      })
    })
  })
})

describe('SessionClerk', () => {
  describe('#deleteAllAccessTokens()', () => {
    describe('should delete every access token of the session', () => {
      const clerk = SessionClerk.create({
        AccessTokenModel: CustomerAccessToken,
        RefreshTokenModel: CustomerRefreshToken,
      })

      const cases = [
        {
          input: {
            sessionKey: 'session-key-91-01', // seeded: 2 access tokens
            transaction: null,
          },
          expected: 2,
        },
        {
          input: {
            sessionKey: 'session-key-94-01', // seeded: 1 access token
            transaction: null,
          },
          expected: 1,
        },
      ]

      test.each(cases)('sessionKey: $input.sessionKey', async ({
        input,
        expected,
      }) => {
        const args = {
          sessionKey: input.sessionKey,
          transaction: input.transaction,
        }

        const received = await clerk.deleteAllAccessTokens(args)

        expect(received)
          .toBe(expected)
      })
    })
  })
})

describe('SessionClerk', () => {
  describe('#revokeSession()', () => {
    describe('should revoke live refresh tokens and delete access tokens of the session', () => {
      const clerk = SessionClerk.create({
        AccessTokenModel: CustomerAccessToken,
        RefreshTokenModel: CustomerRefreshToken,
      })

      const cases = [
        {
          input: {
            sessionKey: 'session-key-92-01', // seeded: 2 live (+1 revoked) refresh, 3 access
            now: new Date('2026-08-13T06:00:13.013Z'),
            transaction: null,
          },
          expected: {
            revokedRefreshTokenCount: 2,
            deletedAccessTokenCount: 3,
          },
        },
        {
          input: {
            sessionKey: 'session-key-95-01', // seeded: 1 live (+1 revoked) refresh, 2 access
            now: new Date('2026-08-14T06:00:14.014Z'),
            transaction: null,
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
        const args = {
          sessionKey: input.sessionKey,
          now: input.now,
          transaction: input.transaction,
        }

        const received = await clerk.revokeSession(args)

        expect(received)
          .toEqual(expected)
      })
    })
  })
})
