import SignInMutationResolver from '../../../../../../../../server/graphql/resolvers/customer/actual/mutations/SignInMutationResolver.js'

describe('SignInMutationResolver', () => {
  describe('.get:schema', () => {
    test('to be fixed value', () => {
      const actual = SignInMutationResolver.schema

      expect(actual)
        .toBe('signIn')
    })
  })
})

describe('SignInMutationResolver', () => {
  describe('#findPasswordHashByEmail()', () => {
    describe('with existing email', () => {
      const passwordHashExpected = expect.stringMatching(/^\$2b\$10\$.{53}$/u)

      const cases = [
        {
          params: {
            email: 'customer.100001@example.com',
          },
          expected: {
            CustomerId: 100001,
            passwordHash: passwordHashExpected,
            savedAt: new Date('2024-01-01T00:00:01.001Z'),
          },
        },
        {
          params: {
            email: 'customer.100002@example.com',
          },
          expected: {
            CustomerId: 100002,
            passwordHash: passwordHashExpected,
            savedAt: new Date('2024-01-02T00:00:02.002Z'),
          },
        },
      ]

      test.each(cases)('email: $params.email', async ({ params, expected }) => {
        const resolver = SignInMutationResolver.create()

        const actual = await resolver.findPasswordHashByEmail(params)

        expect(actual)
          .toHaveProperty(
            'dataValues',
            expect.objectContaining(expected)
          )

        // NOTE: Below matcher will throw error:
        // RangeError: Maximum call stack size exceeded
        // expect(actual)
        //   .toMatchObject(expected)
      })
    })

    describe('with non-existing email', () => {
    })
  })
})
