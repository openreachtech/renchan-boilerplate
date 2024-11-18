import CustomerAccessToken from '../../../../../../../../sequelize/models/CustomerAccessToken'
import SignInMutationResolver from '../../../../../../../../server/graphql/resolvers/customer/actual/mutations/SignInMutationResolver'

describe('SignInMutationResolver', () => {
  describe('#generateTransactionCallback()', () => {
    const resolver = SignInMutationResolver.create()

    describe('to be instance of Function', () => {
      const cases = [
        {
          params: {
            customerId: 100001,
            now: new Date('2024-01-01T00:00:01.001Z'),
          },
        },
        {
          params: {
            customerId: 100002,
            now: new Date('2024-01-02T00:00:02.002Z'),
          },
        },
      ]

      test.each(cases)('customerId: $params.CustomerId', ({ params }) => {
        const actual = resolver.generateTransactionCallback(params)

        expect(actual)
          .toBeInstanceOf(Function)
      })
    })

    describe('to call CustomerAccessToken.buildWithGeneratedAttributes()', () => {
      const cases = [
        {
          params: {
            customerId: 100001,
            now: new Date('2024-01-01T00:00:01.001Z'),
          },
          expected: {
            generatedAt: new Date('2024-01-01T00:00:01.001Z'),
            customerId: 100001,
          },
        },
        {
          params: {
            customerId: 100002,
            now: new Date('2024-01-02T00:00:02.002Z'),
          },
          expected: {
            generatedAt: new Date('2024-01-02T00:00:02.002Z'),
            customerId: 100002,
          },
        },
      ]

      test.each(cases)('customerId: $params.CustomerId', ({ params, expected }) => {
        const buildWithGeneratedAttributesSpy = jest.spyOn(CustomerAccessToken, 'buildWithGeneratedAttributes')

        resolver.generateTransactionCallback(params)

        expect(buildWithGeneratedAttributesSpy)
          .toHaveBeenCalledWith(expected)
      })
    })

    describe('callback works to save', () => {
      const cases = [
        {
          params: {
            customerId: 900001,
            now: new Date('2024-11-01T00:00:01.001Z'),
          },
          expected: {
            CustomerId: 900001,
            accessToken: expect.stringMatching(/^[a-zA-Z0-9]{10}$/u),
            generatedAt: new Date('2024-11-01T00:00:01.001Z'),
            expiredAt: new Date('2024-11-02T00:00:01.001Z'),
          },
        },
        {
          params: {
            customerId: 900002,
            now: new Date('2024-11-02T00:00:02.002Z'),
          },
          expected: {
            CustomerId: 900002,
            accessToken: expect.stringMatching(/^[a-zA-Z0-9]{10}$/u),
            generatedAt: new Date('2024-11-02T00:00:02.002Z'),
            expiredAt: new Date('2024-11-03T00:00:02.002Z'),
          },
        },
      ]

      test.each(cases)('customerId: $params.CustomerId', async ({ params, expected }) => {
        const callback = resolver.generateTransactionCallback(params)

        const entity = await CustomerAccessToken.beginTransaction(callback)

        const savedEntity = await CustomerAccessToken.findByPk(entity.id)

        expect(savedEntity)
          .toHaveProperty('CustomerId', expected.CustomerId)
        expect(savedEntity)
          .toHaveProperty('accessToken', expected.accessToken)
        expect(savedEntity)
          .toHaveProperty('generatedAt', expected.generatedAt)
        expect(savedEntity)
          .toHaveProperty('expiredAt', expected.expiredAt)
      })
    })
  })
})
