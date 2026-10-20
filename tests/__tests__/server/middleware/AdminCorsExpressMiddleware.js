import Env from '@openreachtech/renchan-env'

import CorsExpressMiddleware from '../../../../server/middleware/CorsExpressMiddleware.js'
import AdminCorsExpressMiddleware from '../../../../server/middleware/AdminCorsExpressMiddleware.js'

import AdminGraphqlServerEngine from '../../../../server/graphql/AdminGraphqlServerEngine.js'
import AdminGraphqlShare from '../../../../server/graphql/contexts/AdminGraphqlShare.js'

const {
  EnvironmentFacade,
} = Env

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
            environmentHash: {
              CORS_ADMIN_ORIGINS: 'https://alpha.example,https://beta.example',
            },
          },
          expected: 'https://alpha.example,https://beta.example',
        },
        {
          input: {
            environmentHash: {
              CORS_ADMIN_ORIGINS: null,
            },
          },
          expected: null,
        },
      ]

      test.each(cases)('CORS_ADMIN_ORIGINS: $input.environmentHash.CORS_ADMIN_ORIGINS', ({ input, expected }) => {
        const engine = new AdminGraphqlServerEngine({
          config: AdminGraphqlServerEngine.config,
          share: AdminGraphqlShare.create({
            env: new EnvironmentFacade({
              environmentHash: input.environmentHash,
            })
              .generateFacade(),
          }),
          errorHash: {},
        })
        const middleware = AdminCorsExpressMiddleware.create({
          engine,
        })

        const received = middleware.originsString

        expect(received)
          .toBe(expected)
      })
    })
  })
})
