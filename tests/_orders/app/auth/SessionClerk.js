import SessionClerk from '../../../../app/auth/SessionClerk.js'

import CustomerAccessToken from '../../../../sequelize/models/CustomerAccessToken.js'
import CustomerRefreshToken from '../../../../sequelize/models/CustomerRefreshToken.js'

/**
 * A token is 32 bytes of CSPRNG output rendered as hex.
 */
const TOKEN_PATTERN = /^[0-9a-f]{64}$/u

/**
 * Build a clerk bound to the customer tables.
 *
 * @returns {SessionClerk} - Session clerk.
 */
function createClerk () {
  return SessionClerk.create({
    AccessTokenModel: CustomerAccessToken,
    RefreshTokenModel: CustomerRefreshToken,
  })
}

describe('SessionClerk', () => {
  describe('#issueTokens()', () => {
    const cases = [
      {
        params: {
          customerId: 950001,
          sessionKey: 'clerk-session-key-950001',
          now: new Date('2026-08-01T00:00:01.001Z'),
        },
      },
      {
        params: {
          customerId: 950002,
          sessionKey: 'clerk-session-key-950002',
          now: new Date('2026-08-02T00:00:02.002Z'),
        },
      },
    ]

    test.each(cases)('customerId: $params.customerId', async ({ params }) => {
      const clerk = createClerk()

      const actual = await CustomerAccessToken.beginTransaction(async transaction =>
        clerk.issueTokens({
          customerId: params.customerId,
          sessionKey: params.sessionKey,
          now: params.now,
          transaction,
        })
      )

      expect(actual.accessToken)
        .toMatch(TOKEN_PATTERN)
      expect(actual.refreshToken)
        .toMatch(TOKEN_PATTERN)
      expect(actual.sessionKey)
        .toBe(params.sessionKey)

      const savedAccessToken = await CustomerAccessToken.findOne({
        where: {
          accessToken: actual.accessToken,
        },
      })

      expect(savedAccessToken)
        .toHaveProperty('CustomerId', params.customerId)
      expect(savedAccessToken)
        .toHaveProperty('sessionKey', params.sessionKey)

      // Only the digest lands in the table, never the token the client holds.
      const savedRefreshToken = await CustomerRefreshToken.findOne({
        where: {
          tokenHash: CustomerRefreshToken.hashToken({
            token: actual.refreshToken,
          }),
        },
      })

      expect(savedRefreshToken)
        .toHaveProperty('CustomerId', params.customerId)
      expect(savedRefreshToken)
        .toHaveProperty('sessionKey', params.sessionKey)
      expect(savedRefreshToken)
        .toHaveProperty('usedAt', null)
    })
  })
})

describe('SessionClerk', () => {
  describe('#issueSession()', () => {
    const cases = [
      {
        params: {
          customerId: 951001,
          now: new Date('2026-08-01T00:00:01.001Z'),
        },
      },
      {
        params: {
          customerId: 951002,
          now: new Date('2026-08-02T00:00:02.002Z'),
        },
      },
    ]

    test.each(cases)('customerId: $params.customerId', async ({ params }) => {
      const clerk = createClerk()

      const actual = await CustomerAccessToken.beginTransaction(async transaction =>
        clerk.issueSession({
          customerId: params.customerId,
          now: params.now,
          transaction,
        })
      )

      // A session of its own starts a series of its own: the key is minted, not supplied.
      expect(actual.sessionKey)
        .toMatch(TOKEN_PATTERN)

      const savedAccessToken = await CustomerAccessToken.findOne({
        where: {
          accessToken: actual.accessToken,
        },
      })

      expect(savedAccessToken)
        .toHaveProperty('CustomerId', params.customerId)
      expect(savedAccessToken)
        .toHaveProperty('sessionKey', actual.sessionKey)
    })
  })
})

describe('SessionClerk', () => {
  describe('#findRefreshTokenEntity()', () => {
    const cases = [
      {
        params: {
          customerId: 952001,
          sessionKey: 'clerk-session-key-952001',
          now: new Date('2026-08-01T00:00:01.001Z'),
        },
      },
      {
        params: {
          customerId: 952002,
          sessionKey: 'clerk-session-key-952002',
          now: new Date('2026-08-02T00:00:02.002Z'),
        },
      },
    ]

    test.each(cases)('customerId: $params.customerId', async ({ params }) => {
      const clerk = createClerk()

      const issued = await CustomerAccessToken.beginTransaction(async transaction =>
        clerk.issueTokens({
          customerId: params.customerId,
          sessionKey: params.sessionKey,
          now: params.now,
          transaction,
        })
      )

      const actual = await clerk.findRefreshTokenEntity({
        presentedRefreshToken: issued.refreshToken,
      })

      expect(actual)
        .toHaveProperty('CustomerId', params.customerId)
      expect(actual)
        .toHaveProperty('sessionKey', params.sessionKey)
    })
  })
})

describe('SessionClerk', () => {
  describe('#consumeRefreshToken()', () => {
    const cases = [
      {
        params: {
          customerId: 953001,
          sessionKey: 'clerk-session-key-953001',
          now: new Date('2026-08-01T00:00:01.001Z'),
          consumedAt: new Date('2026-08-01T06:00:01.001Z'),
        },
      },
      {
        params: {
          customerId: 953002,
          sessionKey: 'clerk-session-key-953002',
          now: new Date('2026-08-02T00:00:02.002Z'),
          consumedAt: new Date('2026-08-02T06:00:02.002Z'),
        },
      },
    ]

    test.each(cases)('customerId: $params.customerId', async ({ params }) => {
      const clerk = createClerk()

      const issued = await CustomerAccessToken.beginTransaction(async transaction =>
        clerk.issueTokens({
          customerId: params.customerId,
          sessionKey: params.sessionKey,
          now: params.now,
          transaction,
        })
      )

      const refreshTokenEntity = await clerk.findRefreshTokenEntity({
        presentedRefreshToken: issued.refreshToken,
      })

      await CustomerAccessToken.beginTransaction(async transaction =>
        clerk.consumeRefreshToken({
          refreshTokenEntity,
          now: params.consumedAt,
          transaction,
        })
      )

      const spentRow = await CustomerRefreshToken.findOne({
        where: {
          tokenHash: CustomerRefreshToken.hashToken({
            token: issued.refreshToken,
          }),
        },
      })

      expect(spentRow.usedAt)
        .not
        .toBeNull()
    })
  })
})

describe('SessionClerk', () => {
  describe('#revokeSeries()', () => {
    const cases = [
      {
        params: {
          customerId: 954001,
          sessionKey: 'clerk-session-key-954001',
          now: new Date('2026-08-01T00:00:01.001Z'),
          revokedAt: new Date('2026-08-01T06:00:01.001Z'),
        },
      },
      {
        params: {
          customerId: 954002,
          sessionKey: 'clerk-session-key-954002',
          now: new Date('2026-08-02T00:00:02.002Z'),
          revokedAt: new Date('2026-08-02T06:00:02.002Z'),
        },
      },
    ]

    test.each(cases)('customerId: $params.customerId', async ({ params }) => {
      const clerk = createClerk()

      const issued = await CustomerAccessToken.beginTransaction(async transaction =>
        clerk.issueTokens({
          customerId: params.customerId,
          sessionKey: params.sessionKey,
          now: params.now,
          transaction,
        })
      )

      await CustomerAccessToken.beginTransaction(async transaction =>
        clerk.revokeSeries({
          sessionKey: params.sessionKey,
          now: params.revokedAt,
          transaction,
        })
      )

      // Every refresh token in the series is flagged revoked.
      const refreshRow = await CustomerRefreshToken.findOne({
        where: {
          tokenHash: CustomerRefreshToken.hashToken({
            token: issued.refreshToken,
          }),
        },
      })

      expect(refreshRow.revokedAt)
        .not
        .toBeNull()

      // The access tokens the series handed out are deleted, so the row's absence is what ends them.
      const survivingAccessToken = await CustomerAccessToken.findOne({
        where: {
          accessToken: issued.accessToken,
        },
      })

      expect(survivingAccessToken)
        .toBeNull()
    })
  })
})
