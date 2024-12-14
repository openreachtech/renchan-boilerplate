import CustomerAccessToken from '../../../../../../../../sequelize/models/CustomerAccessToken.js'
import RenewAccessTokenMutationResolver from '../../../../../../../../server/graphql/resolvers/customer/actual/mutations/RenewAccessTokenMutationResolver.js'

describe('RenewAccessTokenMutationResolver', () => {
  describe('.schema', () => {
    test('to be fixed value', () => {
      const expected = 'renewAccessToken'

      const actual = RenewAccessTokenMutationResolver.schema

      expect(actual)
        .toBe(expected)
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('.errorCodeHash', () => {
    test('to be fixed value', () => {
      const expected = {}

      const actual = RenewAccessTokenMutationResolver.errorCodeHash

      expect(actual)
        .toEqual(expected)
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#findAccessToken()', () => {
    const resolver = RenewAccessTokenMutationResolver.create()

    describe('to be entity', () => {
      describe('with available access token', () => {
        const cases = [
          {
            params: {
              accessToken: 'access-token-01-01',
            },
            expected: {
              id: 140101,
            },
          },
          {
            params: {
              accessToken: 'access-token-02-02',
            },
            expected: {
              id: 140202,
            },
          },
          {
            params: {
              accessToken: 'access-token-04-01',
            },
            expected: {
              id: 140401,
            },
          },
        ]

        test.each(cases)('accessToken: $params.accessToken', async ({ params, expected }) => {
          const actual = await resolver.findAccessToken(params)

          expect(actual)
            .toHaveProperty('id', expected.id)
        })
      })

      describe('with expired access token', () => {
        const cases = [
          {
            params: {
              accessToken: 'access-token-02-01',
            },
            expected: {
              id: 140201,
            },
          },
          {
            params: {
              accessToken: 'access-token-03-01',
            },
            expected: {
              id: 140301,
            },
          },
          {
            params: {
              accessToken: 'access-token-03-02',
            },
            expected: {
              id: 140302,
            },
          },
        ]

        test.each(cases)('accessToken: $params.accessToken', async ({ params, expected }) => {
          const actual = await resolver.findAccessToken(params)

          expect(actual)
            .toHaveProperty('id', expected.id)
        })
      })
    })

    describe('to be null', () => {
      describe('with invalid access token', () => {
        const cases = [
          {
            params: {
              accessToken: null,
            },
          },
          {
            params: {
              accessToken: undefined,
            },
          },
        ]

        test.each(cases)('accessToken: $params.accessToken', async ({ params }) => {
          const actual = await resolver.findAccessToken(params)

          expect(actual)
            .toBeNull()
        })
      })
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#isAvailableAccessToken()', () => {
    /**
     * @type {Array<{
     *   params: {
     *     expiredAt: Date
     *   }
     *   truthyCases: Array<{
     *     pointsAt: Date
     *   }>
     *   falsyCases: Array<{
     *     pointsAt: Date
     *   }>
     * }>}
     */
    const cases = [
      {
        params: {
          expiredAt: new Date('2022-08-01T01:00:01.000Z'),
        },
        truthyCases: [
          { pointsAt: new Date('2022-07-01T01:00:01.000Z') },
          { pointsAt: new Date('2022-08-01T01:00:00.999Z') },
        ],
        falsyCases: [
          { pointsAt: new Date('2022-08-01T01:00:01.000Z') }, // on expired at
          { pointsAt: new Date('2022-08-02T01:00:01.000Z') },
        ],
      },
      {
        params: {
          expiredAt: new Date('2022-08-02T02:00:02.000Z'),
        },
        truthyCases: [
          { pointsAt: new Date('2022-08-01T01:00:01.000Z') },
          { pointsAt: new Date('2022-08-02T02:00:01.999Z') },
        ],
        falsyCases: [
          { pointsAt: new Date('2022-08-02T02:00:02.000Z') }, // on expired at
          { pointsAt: new Date('2022-08-03T02:00:02.000Z') },
        ],
      },
      {
        params: {
          expiredAt: new Date('2022-08-03T03:00:03.000Z'),
        },
        truthyCases: [
          { pointsAt: new Date('2022-08-02T02:00:02.000Z') },
          { pointsAt: new Date('2022-08-03T03:00:02.999Z') },
        ],
        falsyCases: [
          { pointsAt: new Date('2022-08-03T03:00:03.000Z') }, // on expired at
          { pointsAt: new Date('2022-08-04T03:00:03.000Z') },
        ],
      },
    ]

    describe.each(cases)('expiredAt: $params.expiredAt', ({ params, truthyCases, falsyCases }) => {
      const resolver = RenewAccessTokenMutationResolver.create()

      /** @type {import('../../../../../../../../sequelize/models/CustomerAccessToken.js').CustomerAccessTokenEntity} */
      const entity = /** @type {*} */ (
        CustomerAccessToken.build({
          expiredAt: params.expiredAt,
        })
      )

      describe('to be truthy', () => {
        test.each(truthyCases)('pointsAt: $pointsAt', ({ pointsAt }) => {
          const actual = resolver.isAvailableAccessToken({
            accessTokenEntity: entity,
            pointsAt,
          })

          expect(actual)
            .toBeTruthy()
        })
      })

      describe('to be falsy', () => {
        test.each(falsyCases)('pointsAt: $pointsAt', ({ pointsAt }) => {
          const actual = resolver.isAvailableAccessToken({
            accessTokenEntity: entity,
            pointsAt,
          })

          expect(actual)
            .toBeFalsy()
        })
      })
    })
  })
})

describe('RenewAccessTokenMutationResolver', () => {
  describe('#formatResponse()', () => {
    const resolver = RenewAccessTokenMutationResolver.create()

    /**
     * @type {Array<{
     *   params: {
     *     accessTokenEntity: import('../../../../../../../../sequelize/models/CustomerAccessToken.js').CustomerAccessTokenEntity | null
     *   }
     *   expected: {
     *     accessToken: string
     *   }
     * }>}
     */
    const cases = /** @type {Array<*>} */ ([
      {
        params: {
          accessTokenEntity: CustomerAccessToken.build({
            accessToken: 'access-token-001',
          }),
        },
        expected: {
          accessToken: 'access-token-001',
        },
      },
      {
        params: {
          accessTokenEntity: CustomerAccessToken.build({
            accessToken: 'access-token-002',
          }),
        },
        expected: {
          accessToken: 'access-token-002',
        },
      },
    ])

    test.each(cases)('accessTokenEntity: $params.accessTokenEntity', ({ params, expected }) => {
      const actual = resolver.formatResponse(params)

      expect(actual)
        .toEqual(expected)
    })
  })
})
