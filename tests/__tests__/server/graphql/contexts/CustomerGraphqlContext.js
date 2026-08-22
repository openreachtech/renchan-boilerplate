import BaseAppGraphqlContext from '../../../../../server/graphql/contexts/BaseAppGraphqlContext.js'
import CustomerGraphqlContext from '../../../../../server/graphql/contexts/CustomerGraphqlContext.js'

describe('CustomerGraphqlContext', () => {
  describe('super class', () => {
    test('to be BaseAppGraphqlContext', () => {
      const actual = CustomerGraphqlContext.prototype

      expect(actual)
        .toBeInstanceOf(BaseAppGraphqlContext)
    })
  })
})

describe('CustomerGraphqlContext', () => {
  describe('.findUser()', () => {
    describe('to be fixed value', () => {
      const cases = [
        {
          params: {
            expressRequest: /** @type {*} */ ({}),
            accessToken: 'access-token$alpha',
            requestedAt: new Date('2024-08-01T01:00:01.001Z'),
          },
        },
        {
          params: {
            expressRequest: /** @type {*} */ ({}),
            accessToken: 'access-token$beta',
            requestedAt: new Date('2024-08-02T02:00:02.002Z'),
          },
        },
      ]

      test.each(cases)('accessToken: $params.accessToken', async ({ params }) => {
        const actual = await CustomerGraphqlContext.findUser(params)

        expect(actual)
          .toBeNull()
      })
    })
  })
})

describe('CustomerGraphqlContext', () => {
  describe('#get:accessToken', () => {
    describe('to return #accessToken', () => {
      const cases = [
        {
          params: {
            expressRequest: /** @type {*} */ ({
              headers: {
                'x-renchan-access-token': 'access-token$alpha',
              },
            }),
            requestParams: /** @type {*} */ ({}),
            engine: /** @type {*} */ ({}),
            userEntity: /** @type {*} */ ({}),
            visa: /** @type {*} */ ({}),
            requestedAt: new Date(),
            uuid: '98765432-abcd-0000-1234-000000000001',
          },
          expected: 'access-token$alpha',
        },
        {
          params: {
            expressRequest: /** @type {*} */ ({
              headers: {
                'x-renchan-access-token': 'access-token$beta',
              },
            }),
            requestParams: /** @type {*} */ ({}),
            engine: /** @type {*} */ ({}),
            userEntity: /** @type {*} */ ({}),
            visa: /** @type {*} */ ({}),
            requestedAt: new Date(),
            uuid: '98765432-abcd-0000-1234-000000000002',
          },
          expected: 'access-token$beta',
        },
      ]

      test.each(cases)('headers: $params.expressRequest.headers', async ({ params, expected }) => {
        const context = new CustomerGraphqlContext(params)

        const actual = context.accessToken

        expect(actual)
          .toBe(expected)
      })
    })
  })
})

describe('CustomerGraphqlContext', () => {
  describe('#get:customer', () => {
    describe('to return #userEntity', () => {
      const cases = [
        {
          params: {
            expressRequest: /** @type {*} */ ({}),
            requestParams: /** @type {*} */ ({}),
            engine: /** @type {*} */ ({}),
            userEntity: /** @type {*} */ ({
              label: 'alphaUser',
              alpha: Symbol('alpha'),
            }),
            visa: /** @type {*} */ ({}),
            requestedAt: new Date(),
            uuid: '98765432-abcd-0000-1234-000000000001',
          },
        },
        {
          params: {
            expressRequest: /** @type {*} */ ({}),
            requestParams: /** @type {*} */ ({}),
            engine: /** @type {*} */ ({}),
            userEntity: /** @type {*} */ ({
              label: 'betaUser',
              beta: Symbol('beta'),
            }),
            visa: /** @type {*} */ ({}),
            requestedAt: new Date(),
            uuid: '98765432-abcd-0000-1234-000000000002',
          },
        },
      ]

      test.each(cases)('$params.userEntity.label', async ({ params }) => {
        const context = new CustomerGraphqlContext(params)

        const actual = context.customer

        expect(actual)
          .toBe(params.userEntity) // same reference
      })
    })
  })
})

describe('CustomerGraphqlContext', () => {
  describe('#get:customerId', () => {
    describe('to return #userId', () => {
      const cases = [
        {
          params: {
            expressRequest: /** @type {*} */ ({}),
            requestParams: /** @type {*} */ ({}),
            engine: /** @type {*} */ ({}),
            userEntity: /** @type {*} */ ({
              id: 10001,
            }),
            visa: /** @type {*} */ ({}),
            requestedAt: new Date(),
            uuid: '98765432-abcd-0000-1234-000000000001',
          },
          expected: 10001,
        },
        {
          params: {
            expressRequest: /** @type {*} */ ({}),
            requestParams: /** @type {*} */ ({}),
            engine: /** @type {*} */ ({}),
            userEntity: /** @type {*} */ ({
              id: 10002,
            }),
            visa: /** @type {*} */ ({}),
            requestedAt: new Date(),
            uuid: '98765432-abcd-0000-1234-000000000002',
          },
          expected: 10002,
        },
      ]

      test.each(cases)('$params.userEntity.label', async ({ params, expected }) => {
        const context = new CustomerGraphqlContext(params)

        const actual = context.customerId

        expect(actual)
          .toBe(expected)
      })
    })
  })
})
