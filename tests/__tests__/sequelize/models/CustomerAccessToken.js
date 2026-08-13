import SessionCredentialGenerator from '../../../../app/session/SessionCredentialGenerator.js'
import CustomerAccessToken from '../../../../sequelize/models/CustomerAccessToken.js'

/**
 * An access token is 32 bytes of CSPRNG output rendered as hex.
 */
const ACCESS_TOKEN_PATTERN = /^[0-9a-f]{64}$/u

describe('CustomerAccessToken', () => {
  describe('.createExpiredAt()', () => {
    // Fifteen minutes. Short on purpose — this is the half of the pair that a leak would expose,
    // and its whole defence is not being worth much for long.
    const now = new Date()
    const expiredAt = new Date(
      now.getTime()
      + (15 * 60 * 1000)
    )

    const cases = [
      {
        params: {
          generatedAt: new Date('2024-01-21T00:00:01.000Z'),
        },
        expected: new Date('2024-01-21T00:15:01.000Z'),
      },
      {
        params: {
          generatedAt: new Date('2024-01-22T00:00:02.000Z'),
        },
        expected: new Date('2024-01-22T00:15:02.000Z'),
      },
      {
        params: {
          generatedAt: new Date('2024-01-23T23:50:03.000Z'),
        },
        expected: new Date('2024-01-24T00:05:03.000Z'),
      },
      {
        params: {
          generatedAt: now,
        },
        expected: expiredAt,
      },
    ]

    describe('to be created Date', () => {
      test.each(cases)('generatedAt: $params.generatedAt', ({ params, expected }) => {
        const actual = CustomerAccessToken.createExpiredAt(params)

        expect(actual)
          .toEqual(expected)
      })
    })
  })
})

describe('CustomerAccessToken', () => {
  describe('.generateAccessToken()', () => {
    describe('to be 32 bytes of hex', () => {
      // The implementation used to be a fixed-length string over ten random characters, which is
      // neither cryptographic nor long enough to be worth guessing at.
      test('to be a 64-character hex string', () => {
        const actual = CustomerAccessToken.generateAccessToken()

        expect(actual)
          .toMatch(ACCESS_TOKEN_PATTERN)
        expect(actual)
          .toHaveLength(64)
      })
    })

    describe('to not repeat itself', () => {
      test('across many calls', () => {
        const tokens = Array.from(
          { length: 100 },
          () => CustomerAccessToken.generateAccessToken()
        )

        expect(new Set(tokens).size)
          .toBe(tokens.length)
      })
    })

    describe('to delegate to the credential generator', () => {
      test('to call factory method of SessionCredentialGenerator', () => {
        const createSpy = jest.spyOn(SessionCredentialGenerator, 'create')

        CustomerAccessToken.generateAccessToken()

        expect(createSpy)
          .toHaveBeenCalledWith()
      })
    })
  })
})

describe('CustomerAccessToken', () => {
  describe('.buildWithGeneratedAttributes()', () => {
    describe('to be instance of own Model', () => {
      const cases = [
        {
          params: {
            userId: 100001,
            sessionKey: 'session-key-01',
            generatedAt: new Date('2024-01-21T00:00:01.000Z'),
            expiredAt: new Date('2024-01-21T00:15:01.000Z'),
            accessToken: 'accessTOKEN$01',
          },
        },
        {
          params: {
            userId: 100002,
            sessionKey: 'session-key-02',
            generatedAt: new Date('2024-01-22T00:00:02.000Z'),
            expiredAt: new Date('2024-01-22T00:15:02.000Z'),
            // accessToken: 'accessTOKEN$02',
          },
        },
        {
          params: {
            userId: 100003,
            sessionKey: 'session-key-03',
            generatedAt: new Date('2024-01-23T00:00:03.000Z'),
            // expiredAt: defaults to generatedAt + fifteen minutes
            accessToken: 'accessTOKEN$03',
          },
        },
        {
          params: {
            userId: 100004,
            sessionKey: 'session-key-04',
            generatedAt: new Date('2024-01-24T00:00:04.000Z'),
            // expiredAt: defaults to generatedAt + fifteen minutes
            // accessToken: 'accessTOKEN$04',
          },
        },
      ]

      test.each(cases)('userId: $params.userId', ({ params }) => {
        const actual = CustomerAccessToken.buildWithGeneratedAttributes(params)

        expect(actual)
          .toBeInstanceOf(CustomerAccessToken)
      })
    })

    describe('to call .build()', () => {
      const cases = [
        {
          params: {
            userId: 100001,
            sessionKey: 'session-key-01',
            generatedAt: new Date('2024-01-21T00:00:01.000Z'),
            expiredAt: new Date('2024-01-21T00:15:01.000Z'),
            accessToken: 'accessTOKEN$01',
          },
          expected: {
            CustomerId: 100001,
            sessionKey: 'session-key-01',
            generatedAt: new Date('2024-01-21T00:00:01.000Z'),
            expiredAt: new Date('2024-01-21T00:15:01.000Z'),
            accessToken: 'accessTOKEN$01',
          },
        },
        {
          params: {
            userId: 100002,
            sessionKey: 'session-key-02',
            generatedAt: new Date('2024-01-22T00:00:02.000Z'),
            expiredAt: new Date('2024-01-22T00:15:02.000Z'),
            // accessToken: defaults to a generated 32-byte hex token
          },
          expected: {
            CustomerId: 100002,
            sessionKey: 'session-key-02',
            generatedAt: new Date('2024-01-22T00:00:02.000Z'),
            expiredAt: new Date('2024-01-22T00:15:02.000Z'),
            accessToken: expect.stringMatching(ACCESS_TOKEN_PATTERN),
          },
        },
        {
          params: {
            userId: 100003,
            sessionKey: 'session-key-03',
            generatedAt: new Date('2024-01-23T00:00:03.000Z'),
            // expiredAt: defaults to generatedAt + fifteen minutes
            accessToken: 'accessTOKEN$03',
          },
          expected: {
            CustomerId: 100003,
            sessionKey: 'session-key-03',
            generatedAt: new Date('2024-01-23T00:00:03.000Z'),
            expiredAt: new Date('2024-01-23T00:15:03.000Z'),
            accessToken: 'accessTOKEN$03',
          },
        },
        {
          params: {
            userId: 100004,
            sessionKey: 'session-key-04',
            generatedAt: new Date('2024-01-24T00:00:04.000Z'),
            // expiredAt: defaults to generatedAt + fifteen minutes
            // accessToken: defaults to a generated 32-byte hex token
          },
          expected: {
            CustomerId: 100004,
            sessionKey: 'session-key-04',
            generatedAt: new Date('2024-01-24T00:00:04.000Z'),
            expiredAt: new Date('2024-01-24T00:15:04.000Z'),
            accessToken: expect.stringMatching(ACCESS_TOKEN_PATTERN),
          },
        },
      ]

      test.each(cases)('userId: $params.userId', ({ params, expected }) => {
        const buildSpy = jest.spyOn(CustomerAccessToken, 'build')

        CustomerAccessToken.buildWithGeneratedAttributes(params)

        expect(buildSpy)
          .toHaveBeenCalledWith(expected)
      })
    })
  })
})

describe('CustomerAccessToken', () => {
  describe('#isExpired()', () => {
    const cases = [
      {
        params: {
          CustomerId: 100001,
          accessToken: 'access-token-100001',
          generatedAt: new Date('2024-01-21T00:00:01.101Z'),
          expiredAt: new Date('2024-01-22T00:00:01.101Z'),
        },
        truthyCases: [
          {
            pointsAt: new Date('2024-01-22T00:00:02.101Z'),
          },
          {
            pointsAt: new Date('2024-01-22T00:00:01.101Z'), // = expiredAt
          },
        ],
        falsyCases: [
          {
            pointsAt: new Date('2024-01-22T00:00:01.100Z'),
          },
          {
            pointsAt: new Date('2024-01-21T00:00:01.101Z'), // = generatedAt
          },
          {
            pointsAt: new Date('2024-01-21T00:00:00.000Z'),
          },
        ],
      },
      {
        params: {
          CustomerId: 100002,
          accessToken: 'access-token-100002',
          generatedAt: new Date('2024-02-22T00:00:02.202Z'),
          expiredAt: new Date('2024-02-23T00:00:02.202Z'),
        },
        truthyCases: [
          {
            pointsAt: new Date('2024-02-23T00:00:03.202Z'),
          },
          {
            pointsAt: new Date('2024-02-23T00:00:02.202Z'), // = expiredAt
          },
        ],
        falsyCases: [
          {
            pointsAt: new Date('2024-02-23T00:00:02.201Z'),
          },
          {
            pointsAt: new Date('2024-02-22T00:00:02.202Z'), // = generatedAt
          },
          {
            pointsAt: new Date('2024-02-22T00:00:01.202Z'),
          },
        ],
      },
    ]

    describe.each(cases)('CustomerId: $params.CustomerId', ({ params, truthyCases, falsyCases }) => {
      describe('to be truthy', () => {
        test.each(truthyCases)('pointsAt: $pointsAt', ({ pointsAt }) => {
          const instance = CustomerAccessToken.build(params)

          const actual = instance.isExpired({
            pointsAt,
          })

          expect(actual)
            .toBeTruthy()
        })
      })

      describe('to be falsy', () => {
        test.each(falsyCases)('pointsAt: $pointsAt', ({ pointsAt }) => {
          const instance = CustomerAccessToken.build(params)

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
