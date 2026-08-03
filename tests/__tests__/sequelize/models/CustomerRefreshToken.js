import SessionCredentialClerk from '../../../../app/auth/SessionCredentialClerk.js'
import CustomerRefreshToken from '../../../../sequelize/models/CustomerRefreshToken.js'
import AdminRefreshToken from '../../../../sequelize/models/AdminRefreshToken.js'

/**
 * A digest is SHA-256 rendered as hex.
 */
const DIGEST_PATTERN = /^[0-9a-f]{64}$/u

describe('CustomerRefreshToken', () => {
  describe('.get:ttlDays', () => {
    test('to be the configured fourteen days', () => {
      const actual = CustomerRefreshToken.ttlDays

      expect(actual)
        .toBe(14)
    })
  })
})

describe('CustomerRefreshToken', () => {
  describe('.createExpiredAt()', () => {
    describe('to be created Date', () => {
      const cases = [
        {
          params: {
            generatedAt: new Date('2026-08-01T00:00:01.000Z'),
          },
          expected: new Date('2026-08-15T00:00:01.000Z'),
        },
        {
          params: {
            generatedAt: new Date('2026-08-20T12:34:56.000Z'),
          },
          expected: new Date('2026-09-03T12:34:56.000Z'),
        },
      ]

      test.each(cases)('generatedAt: $params.generatedAt', ({ params, expected }) => {
        const actual = CustomerRefreshToken.createExpiredAt(params)

        expect(actual)
          .toStrictEqual(expected)
      })
    })

    test('should outlive an access token by a wide margin', () => {
      // The point of the pair: the half that lasts is the one JavaScript cannot read.
      const generatedAt = new Date('2026-08-01T00:00:00.000Z')

      const refreshExpiry = CustomerRefreshToken.createExpiredAt({
        generatedAt,
      })

      expect(refreshExpiry.getTime() - generatedAt.getTime())
        .toBeGreaterThan(24 * 60 * 60 * 1000)
    })
  })
})

describe('CustomerRefreshToken', () => {
  describe('.hashToken()', () => {
    describe('to be a digest, never the token', () => {
      const cases = [
        { params: { token: 'refresh-token-0001' } },
        { params: { token: 'refresh-token-0002' } },
      ]

      test.each(cases)('token: $params.token', ({ params }) => {
        const actual = CustomerRefreshToken.hashToken(params)

        expect(actual)
          .toMatch(DIGEST_PATTERN)
        expect(actual)
          .not
          .toBe(params.token)
      })
    })

    test('should agree with the credential clerk', () => {
      const token = 'refresh-token-0001'

      const actual = CustomerRefreshToken.hashToken({
        token,
      })

      expect(actual)
        .toBe(
          SessionCredentialClerk.create()
            .hashToken({
              token,
            })
        )
    })
  })
})

describe('CustomerRefreshToken', () => {
  describe('.buildWithGeneratedAttributes()', () => {
    describe('should store the digest and not the token', () => {
      // A dump of this table must not be a set of working sessions.
      const cases = [
        {
          params: {
            customerId: 100001,
            sessionKey: 'session-key-0001',
            refreshToken: 'refresh-token-0001',
            generatedAt: new Date('2026-08-01T00:00:01.000Z'),
          },
        },
        {
          params: {
            customerId: 100002,
            sessionKey: 'session-key-0002',
            refreshToken: 'refresh-token-0002',
            generatedAt: new Date('2026-08-02T00:00:02.000Z'),
          },
        },
      ]

      test.each(cases)('customerId: $params.customerId', ({ params }) => {
        const entity = CustomerRefreshToken.buildWithGeneratedAttributes(params)

        expect(entity.tokenHash)
          .toBe(
            CustomerRefreshToken.hashToken({
              token: params.refreshToken,
            })
          )
        expect(entity.tokenHash)
          .not
          .toBe(params.refreshToken)

        expect(entity)
          .toHaveProperty('sessionKey', params.sessionKey)
        expect(entity)
          .toHaveProperty('usedAt', null)
        expect(entity)
          .toHaveProperty('revokedAt', null)
      })
    })
  })
})

describe('CustomerRefreshToken', () => {
  describe('#isExpired()', () => {
    const pointsAt = new Date('2026-08-01T00:00:00.000Z')

    describe('to be truthy', () => {
      const cases = [
        { params: { expiredAt: new Date('2026-08-01T00:00:00.000Z') } }, // = pointsAt
        { params: { expiredAt: new Date('2026-07-31T23:59:59.999Z') } },
      ]

      test.each(cases)('expiredAt: $params.expiredAt', ({ params }) => {
        const entity = CustomerRefreshToken.build({
          CustomerId: 100001,
          sessionKey: 'session-key-0001',
          tokenHash: 'hash-0001',
          generatedAt: new Date('2026-07-30T00:00:00.000Z'),
          expiredAt: params.expiredAt,
          usedAt: null,
          revokedAt: null,
        })

        expect(entity.isExpired({ pointsAt }))
          .toBeTruthy()
      })
    })

    describe('to be falsy', () => {
      const cases = [
        { params: { expiredAt: new Date('2026-08-01T00:00:00.001Z') } },
        { params: { expiredAt: new Date('2026-08-15T00:00:00.000Z') } },
      ]

      test.each(cases)('expiredAt: $params.expiredAt', ({ params }) => {
        const entity = CustomerRefreshToken.build({
          CustomerId: 100002,
          sessionKey: 'session-key-0002',
          tokenHash: 'hash-0002',
          generatedAt: new Date('2026-07-30T00:00:00.000Z'),
          expiredAt: params.expiredAt,
          usedAt: null,
          revokedAt: null,
        })

        expect(entity.isExpired({ pointsAt }))
          .toBeFalsy()
      })
    })
  })
})

describe('CustomerRefreshToken', () => {
  describe('#isUsed()', () => {
    describe('to be truthy', () => {
      const cases = [
        { params: { usedAt: new Date('2026-07-31T12:00:00.000Z') } },
        { params: { usedAt: new Date('2026-08-01T09:30:00.000Z') } },
      ]

      test.each(cases)('usedAt: $params.usedAt', ({ params }) => {
        const entity = CustomerRefreshToken.build({
          CustomerId: 100001,
          sessionKey: 'session-key-0001',
          tokenHash: 'hash-0001',
          generatedAt: new Date('2026-07-30T00:00:00.000Z'),
          expiredAt: new Date('2026-08-15T00:00:00.000Z'),
          usedAt: params.usedAt,
          revokedAt: null,
        })

        expect(entity.isUsed())
          .toBeTruthy()
      })
    })

    describe('to be falsy', () => {
      const cases = [
        { params: { CustomerId: 100002 } },
        { params: { CustomerId: 100003 } },
      ]

      test.each(cases)('CustomerId: $params.CustomerId', ({ params }) => {
        const entity = CustomerRefreshToken.build({
          CustomerId: params.CustomerId,
          sessionKey: 'session-key-0002',
          tokenHash: 'hash-0002',
          generatedAt: new Date('2026-07-30T00:00:00.000Z'),
          expiredAt: new Date('2026-08-15T00:00:00.000Z'),
          usedAt: null,
          revokedAt: null,
        })

        expect(entity.isUsed())
          .toBeFalsy()
      })
    })
  })
})

describe('CustomerRefreshToken', () => {
  describe('#isRevoked()', () => {
    describe('to be truthy', () => {
      const cases = [
        { params: { revokedAt: new Date('2026-07-31T12:00:00.000Z') } },
        { params: { revokedAt: new Date('2026-08-01T09:30:00.000Z') } },
      ]

      test.each(cases)('revokedAt: $params.revokedAt', ({ params }) => {
        const entity = CustomerRefreshToken.build({
          CustomerId: 100001,
          sessionKey: 'session-key-0001',
          tokenHash: 'hash-0001',
          generatedAt: new Date('2026-07-30T00:00:00.000Z'),
          expiredAt: new Date('2026-08-15T00:00:00.000Z'),
          usedAt: null,
          revokedAt: params.revokedAt,
        })

        expect(entity.isRevoked())
          .toBeTruthy()
      })
    })

    describe('to be falsy', () => {
      const cases = [
        { params: { CustomerId: 100002 } },
        { params: { CustomerId: 100003 } },
      ]

      test.each(cases)('CustomerId: $params.CustomerId', ({ params }) => {
        const entity = CustomerRefreshToken.build({
          CustomerId: params.CustomerId,
          sessionKey: 'session-key-0002',
          tokenHash: 'hash-0002',
          generatedAt: new Date('2026-07-30T00:00:00.000Z'),
          expiredAt: new Date('2026-08-15T00:00:00.000Z'),
          usedAt: null,
          revokedAt: null,
        })

        expect(entity.isRevoked())
          .toBeFalsy()
      })
    })
  })
})

describe('CustomerRefreshToken', () => {
  describe('#isAvailable()', () => {
    const pointsAt = new Date('2026-08-01T00:00:00.000Z')

    describe('should be usable when fresh, unused and unrevoked', () => {
      const cases = [
        { params: { expiredAt: new Date('2026-08-15T00:00:00.000Z') } },
        { params: { expiredAt: new Date('2026-08-02T00:00:00.000Z') } },
      ]

      test.each(cases)('expiredAt: $params.expiredAt', ({ params }) => {
        const entity = CustomerRefreshToken.build({
          CustomerId: 100001,
          sessionKey: 'session-key-0001',
          tokenHash: 'hash-0001',
          generatedAt: new Date('2026-07-31T00:00:00.000Z'),
          expiredAt: params.expiredAt,
          usedAt: null,
          revokedAt: null,
        })

        expect(entity.isAvailable({ pointsAt }))
          .toBeTruthy()
      })
    })

    describe('should be unusable once spent, revoked or expired', () => {
      const cases = [
        {
          label: 'spent',
          params: {
            usedAt: new Date('2026-07-31T12:00:00.000Z'),
            revokedAt: null,
            expiredAt: new Date('2026-08-15T00:00:00.000Z'),
          },
        },
        {
          label: 'revoked',
          params: {
            usedAt: null,
            revokedAt: new Date('2026-07-31T12:00:00.000Z'),
            expiredAt: new Date('2026-08-15T00:00:00.000Z'),
          },
        },
        {
          label: 'expired',
          params: {
            usedAt: null,
            revokedAt: null,
            expiredAt: new Date('2026-07-31T00:00:00.000Z'),
          },
        },
      ]

      test.each(cases)('$label', ({ params }) => {
        const entity = CustomerRefreshToken.build({
          CustomerId: 100001,
          sessionKey: 'session-key-0001',
          tokenHash: 'hash-0001',
          generatedAt: new Date('2026-07-30T00:00:00.000Z'),
          expiredAt: params.expiredAt,
          usedAt: params.usedAt,
          revokedAt: params.revokedAt,
        })

        expect(entity.isAvailable({ pointsAt }))
          .toBeFalsy()
      })
    })
  })
})

describe('AdminRefreshToken', () => {
  describe('separation from the customer table', () => {
    test('should be a different model', () => {
      // The two audiences keep their sessions apart, all the way down to the table.
      expect(AdminRefreshToken)
        .not
        .toBe(CustomerRefreshToken)
      expect(AdminRefreshToken.tableName)
        .not
        .toBe(CustomerRefreshToken.tableName)
    })

    test('should digest a token the same way', () => {
      const token = 'refresh-token-0001'

      expect(AdminRefreshToken.hashToken({ token }))
        .toBe(CustomerRefreshToken.hashToken({ token }))
    })
  })
})
