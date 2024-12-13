import {
  RandomTextGenerator,
} from '@openreachtech/renchan-tools'

import CustomerAccessToken from '../../../../sequelize/models/CustomerAccessToken.js'

describe('CustomerAccessToken', () => {
  describe('.createExpiredAt()', () => {
    const now = new Date()
    const expiredAt = new Date(
      now.getTime()
      + (24 * 60 * 60 * 1000)
    )

    const cases = [
      {
        params: {
          generatedAt: new Date('2024-01-21T00:00:01.000Z'),
        },
        expected: new Date('2024-01-22T00:00:01.000Z'),
      },
      {
        params: {
          generatedAt: new Date('2024-01-22T00:00:02.000Z'),
        },
        expected: new Date('2024-01-23T00:00:02.000Z'),
      },
      {
        params: {
          generatedAt: new Date('2024-01-23T00:00:03.000Z'),
        },
        expected: new Date('2024-01-24T00:00:03.000Z'),
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
          .toStrictEqual(expected)
      })
    })
  })
})

describe('CustomerAccessToken', () => {
  describe('.generateAccessToken()', () => {
    describe('to be fixed length string', () => {
      const cases = [
        {
          params: {
            length: 10,
          },
          expected: /^[a-zA-Z0-9]{10}$/u,
        },
        {
          params: {
            length: 15,
          },
          expected: /^[a-zA-Z0-9]{15}$/u,
        },
        {
          params: {
            length: 20,
          },
          expected: /^[a-zA-Z0-9]{20}$/u,
        },
      ]

      test.each(cases)('length: $params.length', ({ params, expected }) => {
        const actual = CustomerAccessToken.generateAccessToken(params)

        expect(actual)
          .toMatch(expected)
      })

      test('with no parameter', () => {
        const expected = /^[a-zA-Z0-9]{10}$/u

        const actual = CustomerAccessToken.generateAccessToken()

        expect(actual)
          .toMatch(expected)
      })
    })

    describe('to call factory method of Generator', () => {
      const cases = [
        {
          params: {
            length: 10,
          },
        },
        {
          params: {
            length: 15,
          },
        },
        {
          params: {
            length: 20,
          },
        },
      ]

      test.each(cases)('length: $params.length', ({ params, expected }) => {
        const createSpy = jest.spyOn(RandomTextGenerator, 'create')

        CustomerAccessToken.generateAccessToken(params)

        expect(createSpy)
          .toHaveBeenCalledWith()
      })

      test('with no parameter', () => {
        const createSpy = jest.spyOn(RandomTextGenerator, 'create')

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
            customerId: 100001,
            generatedAt: new Date('2024-01-21T00:00:01.000Z'),
            expiredAt: new Date('2024-01-22T00:00:01.000Z'),
            accessToken: 'accessTOKEN$01',
          },
        },
        {
          params: {
            customerId: 100002,
            generatedAt: new Date('2024-01-22T00:00:02.000Z'),
            expiredAt: new Date('2024-01-23T00:00:02.000Z'),
            // accessToken: 'accessTOKEN$02',
          },
        },
        {
          params: {
            customerId: 100003,
            generatedAt: new Date('2024-01-23T00:00:03.000Z'),
            // expiredAt: new Date('2024-01-24T00:00:03.000Z'),
            accessToken: 'accessTOKEN$03',
          },
        },
        {
          params: {
            customerId: 100004,
            generatedAt: new Date('2024-01-24T00:00:04.000Z'),
            // expiredAt: new Date('2024-01-25T00:00:04.000Z'),
            // accessToken: 'accessTOKEN$04',
          },
        },
      ]

      test.each(cases)('customerId: $params.customerId', ({ params }) => {
        const actual = CustomerAccessToken.buildWithGeneratedAttributes(params)

        expect(actual)
          .toBeInstanceOf(CustomerAccessToken)
      })
    })

    describe('to call .build()', () => {
      const cases = [
        {
          params: {
            customerId: 100001,
            generatedAt: new Date('2024-01-21T00:00:01.000Z'),
            expiredAt: new Date('2024-01-22T00:00:01.000Z'),
            accessToken: 'accessTOKEN$01',
          },
          expected: {
            CustomerId: 100001,
            generatedAt: new Date('2024-01-21T00:00:01.000Z'),
            expiredAt: new Date('2024-01-22T00:00:01.000Z'),
            accessToken: 'accessTOKEN$01',
          },
        },
        {
          params: {
            customerId: 100002,
            generatedAt: new Date('2024-01-22T00:00:02.000Z'),
            expiredAt: new Date('2024-01-23T00:00:02.000Z'),
            // accessToken: 'accessTOKEN$02',
          },
          expected: {
            CustomerId: 100002,
            generatedAt: new Date('2024-01-22T00:00:02.000Z'),
            expiredAt: new Date('2024-01-23T00:00:02.000Z'),
            accessToken: expect.stringMatching(/^[a-zA-Z0-9]{10}$/u),
          },
        },
        {
          params: {
            customerId: 100003,
            generatedAt: new Date('2024-01-23T00:00:03.000Z'),
            // expiredAt: new Date('2024-01-24T00:00:03.000Z'),
            accessToken: 'accessTOKEN$03',
          },
          expected: {
            CustomerId: 100003,
            generatedAt: new Date('2024-01-23T00:00:03.000Z'),
            expiredAt: new Date('2024-01-24T00:00:03.000Z'),
            accessToken: 'accessTOKEN$03',
          },
        },
        {
          params: {
            customerId: 100004,
            generatedAt: new Date('2024-01-24T00:00:04.000Z'),
            // expiredAt: new Date('2024-01-25T00:00:04.000Z'),
            // accessToken: 'accessTOKEN$04',
          },
          expected: {
            CustomerId: 100004,
            generatedAt: new Date('2024-01-24T00:00:04.000Z'),
            expiredAt: new Date('2024-01-25T00:00:04.000Z'),
            accessToken: expect.stringMatching(/^[a-zA-Z0-9]{10}$/u),
          },
        },
      ]

      test.each(cases)('customerId: $params.customerId', ({ params, expected }) => {
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

describe('CustomerAccessToken', () => {
  describe('#hasEnoughTimeUntilExpired()', () => {
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
            now: new Date('2024-01-21T06:00:01.101Z'), // = on quarter of the period
          },
          {
            now: new Date('2024-01-21T12:00:01.100Z'), // = on before half of the period
          },
        ],
        falsyCases: [
          {
            now: new Date('2024-01-21T12:00:01.101Z'), // = on half of the period
          },
          {
            now: new Date('2024-01-22T18:00:01.101Z'), // = on three quarters of the period
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
            now: new Date('2024-02-22T06:00:02.202Z'), // = on quarter of the period
          },
          {
            now: new Date('2024-02-22T12:00:02.201Z'), // = on before half of the period
          },
        ],
        falsyCases: [
          {
            now: new Date('2024-02-22T12:00:02.202Z'), // = on half of the period
          },
          {
            now: new Date('2024-02-23T18:00:02.202Z'), // = on three quarters of the period
          },
        ],
      },
    ]

    describe.each(cases)('CustomerId: $params.CustomerId', ({ params, truthyCases, falsyCases }) => {
      describe('to be truthy', () => {
        test.each(truthyCases)('now: $now', ({ now }) => {
          const instance = CustomerAccessToken.build(params)

          const actual = instance.hasEnoughTimeUntilExpired({
            now,
          })

          expect(actual)
            .toBeTruthy()
        })
      })

      describe('to be falsy', () => {
        test.each(falsyCases)('now: $now', ({ now }) => {
          const instance = CustomerAccessToken.build(params)

          const actual = instance.hasEnoughTimeUntilExpired({
            now,
          })

          expect(actual)
            .toBeFalsy()
        })
      })
    })
  })
})
