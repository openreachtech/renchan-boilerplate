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
