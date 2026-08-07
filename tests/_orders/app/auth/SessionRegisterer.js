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
