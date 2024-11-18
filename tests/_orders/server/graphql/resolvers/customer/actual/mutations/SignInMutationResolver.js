import SignInMutationResolver from '../../../../../../../../server/graphql/resolvers/customer/actual/mutations/SignInMutationResolver'

import CustomerAccessToken from '../../../../../../../../sequelize/models/CustomerAccessToken'

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

describe('SignInMutationResolver', () => {
  describe('#saveAccessToken()', () => {
    const resolver = SignInMutationResolver.create()

    describe('to call #generateTransactionCallback()', () => {
      /**
       * @type {Array<{
       *   params: {
       *     context: import('../../../../../../../../server/graphql/contexts/CustomerGraphqlContext.js').default
       *     customerId: number
       *   }
       *   expected: {
       *     customerId: number
       *     now: Date
       *   }
       * }>}
       */
      const cases = /** @type {Array<*>} */ ([
        {
          params: {
            context: {
              now: new Date('2024-01-01T00:00:01.001Z'),
            },
            customerId: 100001,
          },
          expected: {
            customerId: 100001,
            now: new Date('2024-01-01T00:00:01.001Z'),
          },
        },
        {
          params: {
            context: {
              now: new Date('2024-01-02T00:00:02.002Z'),
            },
            customerId: 100002,
          },
          expected: {
            customerId: 100002,
            now: new Date('2024-01-02T00:00:02.002Z'),
          },
        },
      ])

      test.each(cases)('customerId: $params.CustomerId', async ({ params, expected }) => {
        const callbackTally = /** @type {*} */ (async () => {})
        const resultTally = {
          value: Symbol('tally'),
        }

        const generateTransactionCallbackSpy = jest.spyOn(resolver, 'generateTransactionCallback')
          .mockReturnValue(callbackTally)
        const beginTransactionSpy = jest.spyOn(CustomerAccessToken, 'beginTransaction')
          .mockImplementation(async () => resultTally)

        const actual = await resolver.saveAccessToken(params)

        expect(actual)
          .toBe(resultTally)

        expect(generateTransactionCallbackSpy)
          .toHaveBeenCalledWith(expected)
        expect(beginTransactionSpy)
          .toHaveBeenCalledWith(callbackTally)
      })
    })

    describe('to be entity', () => {
      /**
       * @type {Array<{
       *   params: {
       *     context: import('../../../../../../../../server/graphql/contexts/CustomerGraphqlContext.js').default
       *     customerId: number
       *   }
       *   expected: {
       *     CustomerId: number
       *     accessToken: RegExp
       *     generatedAt: Date
       *     expiredAt: Date
       *   }
       * }>}
       */
      const cases = /** @type {Array<*>} */ ([
        {
          params: {
            context: {
              now: new Date('2024-11-01T00:00:01.001Z'),
            },
            customerId: 100001,
          },
          expected: {
            CustomerId: 100001,
            accessToken: expect.stringMatching(/^[a-zA-Z0-9]{10}$/u),
            generatedAt: new Date('2024-11-01T00:00:01.001Z'),
            expiredAt: new Date('2024-11-02T00:00:01.001Z'),
          },
        },
        {
          params: {
            context: {
              now: new Date('2024-11-02T00:00:02.002Z'),
            },
            customerId: 100002,
          },
          expected: {
            CustomerId: 100002,
            accessToken: expect.stringMatching(/^[a-zA-Z0-9]{10}$/u),
            generatedAt: new Date('2024-11-02T00:00:02.002Z'),
            expiredAt: new Date('2024-11-03T00:00:02.002Z'),
          },
        },
      ])

      test.each(cases)('customerId: $params.CustomerId', async ({ params, expected }) => {
        const actual = await resolver.saveAccessToken(params)

        expect(actual)
          .toBeInstanceOf(CustomerAccessToken)

        expect(actual)
          .toHaveProperty('CustomerId', expected.CustomerId)
        expect(actual)
          .toHaveProperty('accessToken', expected.accessToken)
        expect(actual)
          .toHaveProperty('generatedAt', expected.generatedAt)
        expect(actual)
          .toHaveProperty('expiredAt', expected.expiredAt)
      })
    })
  })
})

describe('SignInMutationResolver', () => {
  describe('#resolve()', () => {
    const resolver = SignInMutationResolver.create()

    describe('with existing email and correct password', () => {
      /**
       * @type {Array<{
       *   params: {
       *     variables: {
       *       input: {
       *         email: string
       *         password: string
       *       }
       *     }
       *     context: import('../../../../../../../../server/graphql/contexts/CustomerGraphqlContext.js').default
       *   }
       *   expected: {
       *     accessToken: RegExp
       *   }
       * }>}
       */
      const cases = /** @type {Array<*>} */ ([
        {
          params: {
            variables: {
              input: {
                email: 'customer.100001@example.com',
                password: 'pAsswOrd$01',
              },
            },
            context: {
              now: new Date('2024-01-01T00:00:01.001Z'),
            },
          },
          expected: {
            accessToken: expect.stringMatching(/^[a-zA-Z0-9]{10}$/u),
          },
        },
        {
          params: {
            variables: {
              input: {
                email: 'customer.100002@example.com',
                password: 'pAsswOrd$02',
              },
            },
            context: {
              now: new Date('2024-01-02T00:00:02.002Z'),
            },
          },
          expected: {
            accessToken: expect.stringMatching(/^[a-zA-Z0-9]{10}$/u),
          },
        },
      ])

      test.each(cases)('email: $params.variables.input.email', async ({ params, expected }) => {
        const actual = await resolver.resolve(params)

        expect(actual)
          .toEqual(expected)
      })
    })

    describe('with incorrect email or password', () => {
      /**
       * @type {Array<{
       *   params: {
       *     variables: {
       *       input: {
       *         email: string
       *         password: string
       *       }
       *     }
       *     context: import('../../../../../../../../server/graphql/contexts/CustomerGraphqlContext.js').default
       *   }
       *   expected: {
       *     accessToken: RegExp
       *   }
       * }>}
       */
      const cases = /** @type {Array<*>} */ ([
        {
          params: {
            variables: {
              input: {
                email: 'customer.100001@example.com',
                password: 'incorrectPassword', // ❌️
              },
            },
            context: {
              now: new Date('2024-01-01T00:00:01.001Z'),
            },
          },
        },
        {
          params: {
            variables: {
              input: {
                email: 'incorrect.email@example.com', // ❌️
                password: 'pAsswOrd$02',
              },
            },
            context: {
              now: new Date('2024-01-02T00:00:02.002Z'),
            },
          },
        },
        {
          params: {
            variables: {
              input: {
                email: 'incorrect.both@example.com', // ❌️
                password: 'incorrectBoth', // ❌️
              },
            },
            context: {
              now: new Date('2024-01-03T00:00:03.003Z'),
            },
          },
        },
      ])

      test.each(cases)('email: $params.variables.input.email, password: $params.variables.input.password', async ({ params, expected }) => {
        await expect(
          resolver.resolve(params)
        )
          .rejects
          .toThrow('[22.02.01] Incorrect email or password.')
      })
    })
  })
})
