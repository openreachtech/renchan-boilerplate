import {
  BaseGraphqlShare,
} from '@openreachtech/renchan'

import CustomerGraphqlShare from '../../../../../server/graphql/contexts/CustomerGraphqlShare.js'

import AllowedCorsOriginCollection from '../../../../../server/tools/AllowedCorsOriginCollection.js'

describe('CustomerGraphqlShare', () => {
  describe('super class', () => {
    test('to be defined from BaseGraphqlShare', () => {
      const actual = CustomerGraphqlShare.prototype

      expect(actual)
        .toBeInstanceOf(BaseGraphqlShare)
    })
  })
})

describe('CustomerGraphqlShare', () => {
  describe('constructor', () => {
    describe('should keep property', () => {
      describe('#allowedCorsOriginCollection', () => {
        const cases = [
          {
            input: {
              allowedCorsOriginCollection: AllowedCorsOriginCollection.create({
                originsString: 'https://alpha.example',
              }),
            },
          },
          {
            input: {
              allowedCorsOriginCollection: AllowedCorsOriginCollection.create({
                originsString: null,
              }),
            },
          },
        ]

        test.each(cases)('originsString: $input.allowedCorsOriginCollection.originsString', ({ input }) => {
          const args = {
            env: /** @type {*} */ ({}),
            broker: null,
            allowedCorsOriginCollection: input.allowedCorsOriginCollection,
          }

          const share = new CustomerGraphqlShare(args)

          expect(share)
            .toHaveProperty('allowedCorsOriginCollection', input.allowedCorsOriginCollection)
        })
      })
    })
  })
})

describe('CustomerGraphqlShare', () => {
  describe('.create()', () => {
    describe('should fill default allowedCorsOriginCollection', () => {
      test('with no allowedCorsOriginCollection', () => {
        const share = CustomerGraphqlShare.create({})

        expect(share.allowedCorsOriginCollection)
          .toBeInstanceOf(AllowedCorsOriginCollection)
        expect(share.allowedCorsOriginCollection.extractOrigins())
          .toEqual([])
      })
    })
  })
})

describe('CustomerGraphqlShare', () => {
  describe('.createAsync()', () => {
    describe('to keep the origins CORS_CUSTOMER_ORIGINS declares', () => {
      const cases = [
        {
          input: {
            originsString: 'https://alpha.example',
          },
          expected: [
            'https://alpha.example',
          ],
        },
        {
          input: {
            originsString: 'https://alpha.example, https://beta.example',
          },
          expected: [
            'https://alpha.example',
            'https://beta.example',
          ],
        },
      ]

      test.each(cases)('originsString: $input.originsString', async ({ input, expected }) => {
        jest.spyOn(CustomerGraphqlShare, 'generateEnv')
          .mockReturnValueOnce(/** @type {*} */ ({
            CORS_CUSTOMER_ORIGINS: input.originsString,
          }))

        const share = await CustomerGraphqlShare.createAsync({
          config: /** @type {*} */ ({
            redisOptions: null,
          }),
        })

        const actual = share.allowedCorsOriginCollection.extractOrigins()

        expect(actual)
          .toEqual(expected)
      })
    })

    describe('to keep no origins when CORS_CUSTOMER_ORIGINS declares none', () => {
      const cases = [
        {
          input: {
            env: {
              CORS_CUSTOMER_ORIGINS: '',
            },
          },
        },
        {
          input: {
            env: {},
          },
        },
      ]

      test.each(cases)('env: $input.env', async ({ input }) => {
        jest.spyOn(CustomerGraphqlShare, 'generateEnv')
          .mockReturnValueOnce(/** @type {*} */ (input.env))

        const share = await CustomerGraphqlShare.createAsync({
          config: /** @type {*} */ ({
            redisOptions: null,
          }),
        })

        const actual = share.allowedCorsOriginCollection.extractOrigins()

        expect(actual)
          .toEqual([])
      })
    })
  })
})

describe('CustomerGraphqlShare', () => {
  describe('.createAllowedCorsOriginCollection()', () => {
    describe('to be instance of AllowedCorsOriginCollection', () => {
      const cases = [
        {
          input: {
            env: {
              CORS_CUSTOMER_ORIGINS: 'https://alpha.example',
            },
          },
        },
        {
          input: {
            env: {},
          },
        },
      ]

      test.each(cases)('env: $input.env', ({ input }) => {
        const actual = CustomerGraphqlShare.createAllowedCorsOriginCollection({
          env: /** @type {*} */ (input.env),
        })

        expect(actual)
          .toBeInstanceOf(AllowedCorsOriginCollection)
      })
    })

    describe('to keep the value of CORS_CUSTOMER_ORIGINS', () => {
      const cases = [
        {
          input: {
            env: {
              CORS_CUSTOMER_ORIGINS: 'https://alpha.example',
            },
          },
          expected: 'https://alpha.example',
        },
        {
          input: {
            env: {
              CORS_CUSTOMER_ORIGINS: 'https://alpha.example,https://beta.example',
            },
          },
          expected: 'https://alpha.example,https://beta.example',
        },
        {
          input: {
            env: {
              CORS_CUSTOMER_ORIGINS: '',
            },
          },
          expected: '',
        },
      ]

      test.each(cases)('env: $input.env', ({ input, expected }) => {
        const actual = CustomerGraphqlShare.createAllowedCorsOriginCollection({
          env: /** @type {*} */ (input.env),
        })

        expect(actual)
          .toHaveProperty('originsString', expected)
      })
    })
  })
})
