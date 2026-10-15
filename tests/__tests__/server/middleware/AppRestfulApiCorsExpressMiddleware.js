import CorsExpressMiddleware from '../../../../server/middleware/CorsExpressMiddleware.js'
import AppRestfulApiCorsExpressMiddleware from '../../../../server/middleware/AppRestfulApiCorsExpressMiddleware.js'

describe('AppRestfulApiCorsExpressMiddleware', () => {
  describe('inheritance', () => {
    test('should be correct class', () => {
      const received = AppRestfulApiCorsExpressMiddleware.prototype

      expect(received)
        .toBeInstanceOf(CorsExpressMiddleware)
    })
  })
})

describe('AppRestfulApiCorsExpressMiddleware', () => {
  describe('#get:originsString', () => {
    describe('should be the value of CORS_RESTFUL_API_ORIGINS', () => {
      const cases = [
        {
          input: {
            env: {
              CORS_RESTFUL_API_ORIGINS: 'https://alpha.example,https://beta.example',
            },
          },
          expected: 'https://alpha.example,https://beta.example',
        },
        {
          input: {
            env: {
              CORS_RESTFUL_API_ORIGINS: null,
            },
          },
          expected: null,
        },
      ]

      test.each(cases)('CORS_RESTFUL_API_ORIGINS: $input.env.CORS_RESTFUL_API_ORIGINS', ({ input, expected }) => {
        const middleware = AppRestfulApiCorsExpressMiddleware.create({
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
