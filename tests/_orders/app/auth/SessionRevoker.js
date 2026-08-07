import SessionRevoker from '../../../../app/auth/SessionRevoker.js'

import CustomerAccessToken from '../../../../sequelize/models/CustomerAccessToken.js'
import CustomerRefreshToken from '../../../../sequelize/models/CustomerRefreshToken.js'

describe('SessionRevoker', () => {
  describe('#revokeRefreshTokensInSeries()', () => {
    describe('should revoke only the live refresh tokens of the series', () => {
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
        const revoker = SessionRevoker.create({
          AccessTokenModel: CustomerAccessToken,
          RefreshTokenModel: CustomerRefreshToken,
        })
        const args = {
          sessionKey: input.sessionKey,
          now: input.now,
          transaction: input.transaction,
        }

        const received = await revoker.revokeRefreshTokensInSeries(args)

        expect(received)
          .toEqual(expected)
      })
    })
  })
})

describe('SessionRevoker', () => {
  describe('#deleteAccessTokensInSeries()', () => {
    describe('should delete every access token of the series', () => {
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
        const revoker = SessionRevoker.create({
          AccessTokenModel: CustomerAccessToken,
          RefreshTokenModel: CustomerRefreshToken,
        })
        const args = {
          sessionKey: input.sessionKey,
          transaction: input.transaction,
        }

        const received = await revoker.deleteAccessTokensInSeries(args)

        expect(received)
          .toBe(expected)
      })
    })
  })
})

describe('SessionRevoker', () => {
  describe('#revokeSeries()', () => {
    describe('should revoke live refresh tokens and delete access tokens of the series', () => {
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
        const revoker = SessionRevoker.create({
          AccessTokenModel: CustomerAccessToken,
          RefreshTokenModel: CustomerRefreshToken,
        })
        const args = {
          sessionKey: input.sessionKey,
          now: input.now,
          transaction: input.transaction,
        }

        const received = await revoker.revokeSeries(args)

        expect(received)
          .toEqual(expected)
      })
    })
  })
})
