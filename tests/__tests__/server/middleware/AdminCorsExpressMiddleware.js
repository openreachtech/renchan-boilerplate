import CorsExpressMiddleware from '../../../../server/middleware/CorsExpressMiddleware.js'
import AdminCorsExpressMiddleware from '../../../../server/middleware/AdminCorsExpressMiddleware.js'

describe('AdminCorsExpressMiddleware', () => {
  describe('inheritance', () => {
    test('should be correct class', () => {
      const received = AdminCorsExpressMiddleware.prototype

      expect(received)
        .toBeInstanceOf(CorsExpressMiddleware)
    })
  })
})

describe('AdminCorsExpressMiddleware', () => {
  describe('#get:originsString', () => {
    describe('should be the value of CORS_ADMIN_ORIGINS', () => {
      const cases = [
        {
          input: {
            env: {
              CORS_ADMIN_ORIGINS: 'https://alpha.example,https://beta.example',
            },
          },
          expected: 'https://alpha.example,https://beta.example',
        },
        {
          input: {
            env: {
              CORS_ADMIN_ORIGINS: null,
            },
          },
          expected: null,
        },
      ]

      test.each(cases)('CORS_ADMIN_ORIGINS: $input.env.CORS_ADMIN_ORIGINS', ({ input, expected }) => {
        const middleware = AdminCorsExpressMiddleware.create({
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
