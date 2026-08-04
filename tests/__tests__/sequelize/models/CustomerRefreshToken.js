import SessionCredentialClerk from '../../../../app/auth/SessionCredentialClerk.js'
import CustomerRefreshToken from '../../../../sequelize/models/CustomerRefreshToken.js'

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
        .toEqual(expected)
    })
  })
})

describe('CustomerRefreshToken', () => {
  describe('.hashToken()', () => {
    describe('to be a digest, never the token', () => {
      const cases = [
        {
          params: {
            token: 'refresh-token-0001',
          },
        },
        {
          params: {
            token: 'refresh-token-0002',
          },
        },
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

    describe('to agree with the credential clerk', () => {
      const cases = [
        {
          params: {
            token: 'refresh-token-0001',
          },
          expected: SessionCredentialClerk.create()
            .hashToken({
              token: 'refresh-token-0001',
            }),
        },
        {
          params: {
            token: 'refresh-token-0002',
          },
          expected: SessionCredentialClerk.create()
            .hashToken({
              token: 'refresh-token-0002',
            }),
        },
      ]

      test.each(cases)('token: $params.token', ({ params, expected }) => {
        const actual = CustomerRefreshToken.hashToken(params)

        expect(actual)
          .toBe(expected)
      })
    })
  })
})

describe('CustomerRefreshToken', () => {
  describe('.buildWithGeneratedAttributes()', () => {
    describe('to be instance of own model', () => {
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
        const actual = CustomerRefreshToken.buildWithGeneratedAttributes(params)

        expect(actual)
          .toBeInstanceOf(CustomerRefreshToken)
      })
    })

    describe('to call .build() with the digest, never the token', () => {
      const cases = [
        {
          params: {
            customerId: 100001,
            sessionKey: 'session-key-0001',
            refreshToken: 'refresh-token-0001',
            generatedAt: new Date('2026-08-01T00:00:01.000Z'),
          },
          expected: {
            CustomerId: 100001,
            sessionKey: 'session-key-0001',
            tokenHash: expect.stringMatching(DIGEST_PATTERN),
            generatedAt: new Date('2026-08-01T00:00:01.000Z'),
            expiredAt: new Date('2026-08-15T00:00:01.000Z'),
            usedAt: null,
            revokedAt: null,
          },
        },
        {
          params: {
            customerId: 100002,
            sessionKey: 'session-key-0002',
            refreshToken: 'refresh-token-0002',
            generatedAt: new Date('2026-08-02T00:00:02.000Z'),
          },
          expected: {
            CustomerId: 100002,
            sessionKey: 'session-key-0002',
            tokenHash: expect.stringMatching(DIGEST_PATTERN),
            generatedAt: new Date('2026-08-02T00:00:02.000Z'),
            expiredAt: new Date('2026-08-16T00:00:02.000Z'),
            usedAt: null,
            revokedAt: null,
          },
        },
      ]

      test.each(cases)('customerId: $params.customerId', ({ params, expected }) => {
        const buildSpy = jest.spyOn(CustomerRefreshToken, 'build')

        CustomerRefreshToken.buildWithGeneratedAttributes(params)

        expect(buildSpy)
          .toHaveBeenCalledWith(expected)
      })
    })
  })
})

describe('CustomerRefreshToken', () => {
  describe('#isExpired()', () => {
    const cases = [
      {
        params: {
          CustomerId: 100001,
          sessionKey: 'session-key-0001',
          tokenHash: 'token-hash-0001',
          usedAt: null,
          revokedAt: null,
          generatedAt: new Date('2026-07-30T00:00:00.000Z'),
          expiredAt: new Date('2026-08-01T00:00:00.000Z'),
        },
        truthyCases: [
          {
            pointsAt: new Date('2026-08-01T00:00:00.001Z'),
          },
          {
            pointsAt: new Date('2026-08-01T00:00:00.000Z'), // = expiredAt
          },
        ],
        falsyCases: [
          {
            pointsAt: new Date('2026-07-31T23:59:59.999Z'),
          },
          {
            pointsAt: new Date('2026-07-30T12:00:00.000Z'),
          },
        ],
      },
      {
        params: {
          CustomerId: 100002,
          sessionKey: 'session-key-0002',
          tokenHash: 'token-hash-0002',
          usedAt: null,
          revokedAt: null,
          generatedAt: new Date('2026-08-20T00:00:00.000Z'),
          expiredAt: new Date('2026-09-03T00:00:00.000Z'),
        },
        truthyCases: [
          {
            pointsAt: new Date('2026-09-10T00:00:00.000Z'),
          },
          {
            pointsAt: new Date('2026-09-03T00:00:00.000Z'), // = expiredAt
          },
        ],
        falsyCases: [
          {
            pointsAt: new Date('2026-09-02T23:59:59.999Z'),
          },
          {
            pointsAt: new Date('2026-08-25T00:00:00.000Z'),
          },
        ],
      },
    ]

    describe.each(cases)('CustomerId: $params.CustomerId', ({ params, truthyCases, falsyCases }) => {
      describe('to be truthy', () => {
        test.each(truthyCases)('pointsAt: $pointsAt', ({ pointsAt }) => {
          const instance = CustomerRefreshToken.build(params)

          const actual = instance.isExpired({
            pointsAt,
          })

          expect(actual)
            .toBeTruthy()
        })
      })

      describe('to be falsy', () => {
        test.each(falsyCases)('pointsAt: $pointsAt', ({ pointsAt }) => {
          const instance = CustomerRefreshToken.build(params)

          const actual = instance.isExpired({
            pointsAt,
          })

          expect(actual)
            .toBeFalsy()
        })
      })
    })
  })
})

describe('CustomerRefreshToken', () => {
  describe('#isUsed()', () => {
    describe('to be truthy', () => {
      const cases = [
        {
          params: {
            CustomerId: 100001,
            sessionKey: 'session-key-0001',
            tokenHash: 'token-hash-0001',
            usedAt: new Date('2026-07-31T12:00:00.000Z'),
            revokedAt: null,
            generatedAt: new Date('2026-07-30T00:00:00.000Z'),
            expiredAt: new Date('2026-08-13T00:00:00.000Z'),
          },
        },
        {
          params: {
            CustomerId: 100002,
            sessionKey: 'session-key-0002',
            tokenHash: 'token-hash-0002',
            usedAt: new Date('2026-08-01T09:30:00.000Z'),
            revokedAt: null,
            generatedAt: new Date('2026-07-31T00:00:00.000Z'),
            expiredAt: new Date('2026-08-14T00:00:00.000Z'),
          },
        },
      ]

      test.each(cases)('usedAt: $params.usedAt', ({ params }) => {
        const instance = CustomerRefreshToken.build(params)

        const actual = instance.isUsed()

        expect(actual)
          .toBeTruthy()
      })
    })

    describe('to be falsy', () => {
      const cases = [
        {
          params: {
            CustomerId: 100003,
            sessionKey: 'session-key-0003',
            tokenHash: 'token-hash-0003',
            usedAt: null,
            revokedAt: null,
            generatedAt: new Date('2026-08-01T00:00:00.000Z'),
            expiredAt: new Date('2026-08-15T00:00:00.000Z'),
          },
        },
        {
          params: {
            CustomerId: 100004,
            sessionKey: 'session-key-0004',
            tokenHash: 'token-hash-0004',
            usedAt: null,
            revokedAt: null,
            generatedAt: new Date('2026-08-02T00:00:00.000Z'),
            expiredAt: new Date('2026-08-16T00:00:00.000Z'),
          },
        },
      ]

      test.each(cases)('CustomerId: $params.CustomerId', ({ params }) => {
        const instance = CustomerRefreshToken.build(params)

        const actual = instance.isUsed()

        expect(actual)
          .toBeFalsy()
      })
    })
  })
})

describe('CustomerRefreshToken', () => {
  describe('#isRevoked()', () => {
    describe('to be truthy', () => {
      const cases = [
        {
          params: {
            CustomerId: 100005,
            sessionKey: 'session-key-0005',
            tokenHash: 'token-hash-0005',
            usedAt: null,
            revokedAt: new Date('2026-07-31T13:00:00.000Z'),
            generatedAt: new Date('2026-07-30T00:00:00.000Z'),
            expiredAt: new Date('2026-08-13T00:00:00.000Z'),
          },
        },
        {
          params: {
            CustomerId: 100006,
            sessionKey: 'session-key-0006',
            tokenHash: 'token-hash-0006',
            usedAt: null,
            revokedAt: new Date('2026-08-01T10:30:00.000Z'),
            generatedAt: new Date('2026-07-31T00:00:00.000Z'),
            expiredAt: new Date('2026-08-14T00:00:00.000Z'),
          },
        },
      ]

      test.each(cases)('revokedAt: $params.revokedAt', ({ params }) => {
        const instance = CustomerRefreshToken.build(params)

        const actual = instance.isRevoked()

        expect(actual)
          .toBeTruthy()
      })
    })

    describe('to be falsy', () => {
      const cases = [
        {
          params: {
            CustomerId: 100007,
            sessionKey: 'session-key-0007',
            tokenHash: 'token-hash-0007',
            usedAt: null,
            revokedAt: null,
            generatedAt: new Date('2026-08-01T00:00:00.000Z'),
            expiredAt: new Date('2026-08-15T00:00:00.000Z'),
          },
        },
        {
          params: {
            CustomerId: 100008,
            sessionKey: 'session-key-0008',
            tokenHash: 'token-hash-0008',
            usedAt: null,
            revokedAt: null,
            generatedAt: new Date('2026-08-02T00:00:00.000Z'),
            expiredAt: new Date('2026-08-16T00:00:00.000Z'),
          },
        },
      ]

      test.each(cases)('CustomerId: $params.CustomerId', ({ params }) => {
        const instance = CustomerRefreshToken.build(params)

        const actual = instance.isRevoked()

        expect(actual)
          .toBeFalsy()
      })
    })
  })
})

describe('CustomerRefreshToken', () => {
  describe('#isAvailable()', () => {
    describe('to be truthy', () => {
      const cases = [
        {
          params: {
            CustomerId: 100001,
            sessionKey: 'session-key-0001',
            tokenHash: 'token-hash-0001',
            usedAt: null,
            revokedAt: null,
            generatedAt: new Date('2026-07-31T00:00:00.000Z'),
            expiredAt: new Date('2026-08-15T00:00:00.000Z'),
          },
          pointsAt: new Date('2026-08-01T00:00:00.000Z'),
        },
        {
          params: {
            CustomerId: 100002,
            sessionKey: 'session-key-0002',
            tokenHash: 'token-hash-0002',
            usedAt: null,
            revokedAt: null,
            generatedAt: new Date('2026-08-01T00:00:00.000Z'),
            expiredAt: new Date('2026-08-02T00:00:00.000Z'),
          },
          pointsAt: new Date('2026-08-01T12:00:00.000Z'),
        },
      ]

      test.each(cases)('expiredAt: $params.expiredAt', ({ params, pointsAt }) => {
        const instance = CustomerRefreshToken.build(params)

        const actual = instance.isAvailable({
          pointsAt,
        })

        expect(actual)
          .toBeTruthy()
      })
    })

    describe('to be falsy when spent', () => {
      test('should refuse a used token', () => {
        const instance = CustomerRefreshToken.build({
          CustomerId: 100003,
          sessionKey: 'session-key-0003',
          tokenHash: 'token-hash-0003',
          usedAt: new Date('2026-07-31T12:00:00.000Z'),
          revokedAt: null,
          generatedAt: new Date('2026-07-30T00:00:00.000Z'),
          expiredAt: new Date('2026-08-15T00:00:00.000Z'),
        })

        const actual = instance.isAvailable({
          pointsAt: new Date('2026-08-01T00:00:00.000Z'),
        })

        expect(actual)
          .toBeFalsy()
      })
    })

    describe('to be falsy when revoked', () => {
      test('should refuse a revoked token', () => {
        const instance = CustomerRefreshToken.build({
          CustomerId: 100004,
          sessionKey: 'session-key-0004',
          tokenHash: 'token-hash-0004',
          usedAt: null,
          revokedAt: new Date('2026-07-31T12:00:00.000Z'),
          generatedAt: new Date('2026-07-30T00:00:00.000Z'),
          expiredAt: new Date('2026-08-15T00:00:00.000Z'),
        })

        const actual = instance.isAvailable({
          pointsAt: new Date('2026-08-01T00:00:00.000Z'),
        })

        expect(actual)
          .toBeFalsy()
      })
    })

    describe('to be falsy when expired', () => {
      test('should refuse an expired token', () => {
        const instance = CustomerRefreshToken.build({
          CustomerId: 100005,
          sessionKey: 'session-key-0005',
          tokenHash: 'token-hash-0005',
          usedAt: null,
          revokedAt: null,
          generatedAt: new Date('2026-07-30T00:00:00.000Z'),
          expiredAt: new Date('2026-07-31T00:00:00.000Z'),
        })

        const actual = instance.isAvailable({
          pointsAt: new Date('2026-08-01T00:00:00.000Z'),
        })

        expect(actual)
          .toBeFalsy()
      })
    })
  })
})
