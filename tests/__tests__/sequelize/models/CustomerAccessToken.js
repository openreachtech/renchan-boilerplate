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
