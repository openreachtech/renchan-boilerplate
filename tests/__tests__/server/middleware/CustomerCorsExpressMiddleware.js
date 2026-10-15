import Env from '@openreachtech/renchan-env'

import CorsExpressMiddleware from '../../../../server/middleware/CorsExpressMiddleware.js'
import CustomerCorsExpressMiddleware from '../../../../server/middleware/CustomerCorsExpressMiddleware.js'

import CustomerGraphqlServerEngine from '../../../../server/graphql/CustomerGraphqlServerEngine.js'
import CustomerGraphqlShare from '../../../../server/graphql/contexts/CustomerGraphqlShare.js'

const {
  EnvironmentFacade,
} = Env

describe('CustomerCorsExpressMiddleware', () => {
  describe('inheritance', () => {
    test('should be correct class', () => {
      const received = CustomerCorsExpressMiddleware.prototype

      expect(received)
        .toBeInstanceOf(CorsExpressMiddleware)
    })
  })
})

describe('CustomerCorsExpressMiddleware', () => {
  describe('#get:originsString', () => {
    describe('should be the value of CORS_CUSTOMER_ORIGINS', () => {
      const cases = [
        {
          input: {
            environmentHash: {
              CORS_CUSTOMER_ORIGINS: 'https://alpha.example,https://beta.example',
            },
          },
          expected: 'https://alpha.example,https://beta.example',
        },
        {
          input: {
            environmentHash: {
              CORS_CUSTOMER_ORIGINS: null,
            },
          },
          expected: null,
        },
      ]

      test.each(cases)('CORS_CUSTOMER_ORIGINS: $input.environmentHash.CORS_CUSTOMER_ORIGINS', ({ input, expected }) => {
        const engine = new CustomerGraphqlServerEngine({
          config: CustomerGraphqlServerEngine.config,
          share: CustomerGraphqlShare.create({
            env: new EnvironmentFacade({
              environmentHash: input.environmentHash,
            })
              .generateFacade(),
          }),
          errorHash: {},
        })
        const middleware = CustomerCorsExpressMiddleware.create({
          engine,
        })

        const received = middleware.originsString

        expect(received)
          .toBe(expected)
      })
    })
  })
})
