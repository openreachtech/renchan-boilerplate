import Env from '@openreachtech/renchan-env'

import CorsExpressMiddleware from '../../../../server/middleware/CorsExpressMiddleware.js'
import AppRestfulApiCorsExpressMiddleware from '../../../../server/middleware/AppRestfulApiCorsExpressMiddleware.js'

import AppRestfulApiServerEngine from '../../../../server/restfulapi/AppRestfulApiServerEngine.js'
import AppRestfulApiShare from '../../../../server/restfulapi/contexts/AppRestfulApiShare.js'

const {
  EnvironmentFacade,
} = Env

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
            environmentHash: {
              CORS_RESTFUL_API_ORIGINS: 'https://alpha.example,https://beta.example',
            },
          },
          expected: 'https://alpha.example,https://beta.example',
        },
        {
          input: {
            environmentHash: {
              CORS_RESTFUL_API_ORIGINS: null,
            },
          },
          expected: null,
        },
      ]

      test.each(cases)('CORS_RESTFUL_API_ORIGINS: $input.environmentHash.CORS_RESTFUL_API_ORIGINS', ({ input, expected }) => {
        const engine = new AppRestfulApiServerEngine({
          config: AppRestfulApiServerEngine.config,
          share: AppRestfulApiShare.create({
            env: new EnvironmentFacade({
              environmentHash: input.environmentHash,
            })
              .generateFacade(),
          }),
          errorResponseHash: {},
        })
        const middleware = AppRestfulApiCorsExpressMiddleware.create({
          engine,
        })

        const received = middleware.originsString

        expect(received)
          .toBe(expected)
      })
    })
  })
})
