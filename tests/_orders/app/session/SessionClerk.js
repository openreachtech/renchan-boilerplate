import SessionClerk from '../../../../app/session/SessionClerk.js'
import SessionSavingResult from '../../../../app/session/SessionSavingResult.js'
import SessionRevocationResult from '../../../../app/session/SessionRevocationResult.js'

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
          expected: SessionSavingResult.create({
            error: null,
            credentialPair: {
              accessTokenEntity: expect.any(CustomerAccessToken),
              refreshTokenEntity: expect.any(CustomerRefreshToken),
              refreshToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
            },
          }),
        },
        {
          input: {
            customerId: 950002,
            sessionKey: 'clerk-session-key-950002',
            now: new Date('2026-08-02T00:00:02.002Z'),
          },
          expected: SessionSavingResult.create({
            error: null,
            credentialPair: {
              accessTokenEntity: expect.any(CustomerAccessToken),
              refreshTokenEntity: expect.any(CustomerRefreshToken),
              refreshToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
            },
          }),
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
        }

        const received = await clerk.saveSession(args)

        expect(received)
          .toEqual(expected)
        expect(received)
          .toBeInstanceOf(SessionSavingResult)
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
          expected: SessionSavingResult.create({
            error: null,
            credentialPair: {
              accessTokenEntity: expect.any(CustomerAccessToken),
              refreshTokenEntity: expect.any(CustomerRefreshToken),
              refreshToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
            },
          }),
        },
        {
          input: {
            customerId: 951002,
            now: new Date('2026-08-04T00:00:04.004Z'),
          },
          expected: SessionSavingResult.create({
            error: null,
            credentialPair: {
              accessTokenEntity: expect.any(CustomerAccessToken),
              refreshTokenEntity: expect.any(CustomerRefreshToken),
              refreshToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
            },
          }),
        },
      ]

      test.each(cases)('customerId: $input.customerId', async ({
        input,
        expected,
      }) => {
        const args = {
          customerId: input.customerId,
          now: input.now,
        }

        const received = await clerk.saveSession(args)

        expect(received)
          .toEqual(expected)
        expect(received)
          .toBeInstanceOf(SessionSavingResult)
      })
    })

    describe('should report failure when saving throws', () => {
      const clerk = SessionClerk.create({
        AccessTokenModel: CustomerAccessToken,
        RefreshTokenModel: CustomerRefreshToken,
      })

      const cases = [
        {
          input: {
            customerId: 955001,
            now: new Date('2026-08-15T06:00:15.015Z'),
          },
        },
        {
          input: {
            customerId: 955002,
            now: new Date('2026-08-16T06:00:16.016Z'),
          },
        },
      ]

      test.each(cases)('customerId: $input.customerId', async ({ input }) => {
        jest.spyOn(clerk, 'saveTokenPair')
          .mockRejectedValue(new Error('Failed to save the session token pair'))
        const args = {
          customerId: input.customerId,
          now: input.now,
        }
        const expected = SessionSavingResult.create({
          error: expect.any(Error),
          credentialPair: null,
        })

        const received = await clerk.saveSession(args)

        expect(received)
          .toEqual(expected)
        expect(received)
          .toBeInstanceOf(SessionSavingResult)
      })
    })

    describe('should join an outer transaction and report without throwing', () => {
      const clerk = SessionClerk.create({
        AccessTokenModel: CustomerAccessToken,
        RefreshTokenModel: CustomerRefreshToken,
      })

      const cases = [
        {
          input: {
            customerId: 958001,
            now: new Date('2026-08-21T06:00:21.021Z'),
          },
          expected: SessionSavingResult.create({
            error: null,
            credentialPair: {
              accessTokenEntity: expect.any(CustomerAccessToken),
              refreshTokenEntity: expect.any(CustomerRefreshToken),
              refreshToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
            },
          }),
        },
        {
          input: {
            customerId: 958002,
            now: new Date('2026-08-22T06:00:22.022Z'),
          },
          expected: SessionSavingResult.create({
            error: null,
            credentialPair: {
              accessTokenEntity: expect.any(CustomerAccessToken),
              refreshTokenEntity: expect.any(CustomerRefreshToken),
              refreshToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
            },
          }),
        },
      ]

      test.each(cases)('customerId: $input.customerId', async ({
        input,
        expected,
      }) => {
        const received = await CustomerAccessToken.beginTransaction(async transaction =>
          clerk.saveSession({
            customerId: input.customerId,
            now: input.now,
            transaction,
          })
        )

        expect(received)
          .toEqual(expected)
        expect(received)
          .toBeInstanceOf(SessionSavingResult)
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
          },
          expected: SessionRevocationResult.create({
            error: null,
            revocation: {
              revokedRefreshTokenCount: 2,
              deletedAccessTokenCount: 3,
            },
          }),
        },
        {
          input: {
            sessionKey: 'session-key-95-01', // seeded: 1 live (+1 revoked) refresh, 2 access
            now: new Date('2026-08-14T06:00:14.014Z'),
          },
          expected: SessionRevocationResult.create({
            error: null,
            revocation: {
              revokedRefreshTokenCount: 1,
              deletedAccessTokenCount: 2,
            },
          }),
        },
      ]

      test.each(cases)('sessionKey: $input.sessionKey', async ({
        input,
        expected,
      }) => {
        const args = {
          sessionKey: input.sessionKey,
          now: input.now,
        }

        const received = await clerk.revokeSession(args)

        expect(received)
          .toEqual(expected)
        expect(received)
          .toBeInstanceOf(SessionRevocationResult)
      })
    })

    describe('should report failure when revoking throws', () => {
      const clerk = SessionClerk.create({
        AccessTokenModel: CustomerAccessToken,
        RefreshTokenModel: CustomerRefreshToken,
      })

      const cases = [
        {
          input: {
            sessionKey: 'session-key-957001',
            now: new Date('2026-08-17T06:00:17.017Z'),
          },
        },
        {
          input: {
            sessionKey: 'session-key-957002',
            now: new Date('2026-08-18T06:00:18.018Z'),
          },
        },
      ]

      test.each(cases)('sessionKey: $input.sessionKey', async ({ input }) => {
        jest.spyOn(clerk, 'revokeAllRefreshTokens')
          .mockRejectedValue(new Error('Failed to revoke the session tokens'))
        const args = {
          sessionKey: input.sessionKey,
          now: input.now,
        }
        const expected = SessionRevocationResult.create({
          error: expect.any(Error),
          revocation: null,
        })

        const received = await clerk.revokeSession(args)

        expect(received)
          .toEqual(expected)
        expect(received)
          .toBeInstanceOf(SessionRevocationResult)
      })
    })
  })
})

describe('SessionClerk', () => {
  describe('#rotateSession()', () => {
    describe('should issue the next pair in the same series', () => {
      const clerk = SessionClerk.create({
        AccessTokenModel: CustomerAccessToken,
        RefreshTokenModel: CustomerRefreshToken,
      })

      const cases = [
        {
          input: {
            customerId: 954001,
            sessionKey: 'clerk-session-key-954001',
            refreshToken: 'rotate-refresh-token-954001',
            generatedAt: new Date('2026-08-05T00:00:05.005Z'),
            now: new Date('2026-08-05T06:00:05.005Z'),
          },
          expected: 'clerk-session-key-954001',
        },
        {
          input: {
            customerId: 954002,
            sessionKey: 'clerk-session-key-954002',
            refreshToken: 'rotate-refresh-token-954002',
            generatedAt: new Date('2026-08-06T00:00:06.006Z'),
            now: new Date('2026-08-06T06:00:06.006Z'),
          },
          expected: 'clerk-session-key-954002',
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
          refreshTokenEntity,
          now: input.now,
        }

        const result = await clerk.rotateSession(args)
        const received = result.credentialPair.refreshTokenEntity.sessionKey

        expect(received)
          .toBe(expected)
        expect(result)
          .toBeInstanceOf(SessionSavingResult)
      })
    })

    describe('should report failure when saving throws', () => {
      const clerk = SessionClerk.create({
        AccessTokenModel: CustomerAccessToken,
        RefreshTokenModel: CustomerRefreshToken,
      })

      const cases = [
        {
          input: {
            customerId: 956001,
            sessionKey: 'clerk-session-key-956001',
            refreshToken: 'rotate-refresh-token-956001',
            generatedAt: new Date('2026-08-19T00:00:19.019Z'),
            now: new Date('2026-08-19T06:00:19.019Z'),
          },
        },
        {
          input: {
            customerId: 956002,
            sessionKey: 'clerk-session-key-956002',
            refreshToken: 'rotate-refresh-token-956002',
            generatedAt: new Date('2026-08-20T00:00:20.020Z'),
            now: new Date('2026-08-20T06:00:20.020Z'),
          },
        },
      ]

      test.each(cases)('sessionKey: $input.sessionKey', async ({ input }) => {
        const refreshTokenEntity = CustomerRefreshToken.buildWithGeneratedAttributes({
          customerId: input.customerId,
          sessionKey: input.sessionKey,
          refreshToken: input.refreshToken,
          generatedAt: input.generatedAt,
        })
        jest.spyOn(clerk, 'saveTokenPair')
          .mockRejectedValue(new Error('Failed to save the session token pair'))
        const args = {
          refreshTokenEntity,
          now: input.now,
        }
        const expected = SessionSavingResult.create({
          error: expect.any(Error),
          credentialPair: null,
        })

        const received = await clerk.rotateSession(args)

        expect(received)
          .toEqual(expected)
        expect(received)
          .toBeInstanceOf(SessionSavingResult)
      })
    })
  })
})
