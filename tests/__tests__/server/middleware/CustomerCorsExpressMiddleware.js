import CorsExpressMiddleware from '../../../../server/middleware/CorsExpressMiddleware.js'
import CustomerCorsExpressMiddleware from '../../../../server/middleware/CustomerCorsExpressMiddleware.js'

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
            env: {
              CORS_CUSTOMER_ORIGINS: 'https://alpha.example,https://beta.example',
            },
          },
          expected: 'https://alpha.example,https://beta.example',
        },
        {
          input: {
            env: {
              CORS_CUSTOMER_ORIGINS: null,
            },
          },
          expected: null,
        },
      ]

      test.each(cases)('CORS_CUSTOMER_ORIGINS: $input.env.CORS_CUSTOMER_ORIGINS', ({ input, expected }) => {
        const middleware = CustomerCorsExpressMiddleware.create({
          engine: /** @type {*} */ ({
            share: {
              env: input.env,
            },
          }),
        })

        const received = middleware.originsString

        expect(received)
          .toBe(expected)
      })
    })
  })
})
