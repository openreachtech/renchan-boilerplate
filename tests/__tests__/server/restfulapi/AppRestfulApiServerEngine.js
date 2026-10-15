import Env from '@openreachtech/renchan-env'

import AppRestfulApiServerEngine from '../../../../server/restfulapi/AppRestfulApiServerEngine.js'

import AppRestfulApiShare from '../../../../server/restfulapi/contexts/AppRestfulApiShare.js'

import AppRestfulApiCorsExpressMiddleware from '../../../../server/middleware/AppRestfulApiCorsExpressMiddleware.js'

import MockExpressRequest from '../../../mocks/MockExpressRequest.js'
import MockExpressResponse from '../../../mocks/MockExpressResponse.js'

const {
  EnvironmentFacade,
} = Env

describe('AppRestfulApiServerEngine', () => {
  describe('.get:ExpressMiddleware', () => {
    describe('when called as is', () => {
      test('should be the CORS middleware', () => {
        const expected = [
          AppRestfulApiCorsExpressMiddleware,
        ]

        const received = AppRestfulApiServerEngine.ExpressMiddleware

        expect(received)
          .toStrictEqual(expected)
      })
    })
  })
})

describe('AppRestfulApiServerEngine', () => {
  describe('#collectMiddleware()', () => {
    describe('to mount the middleware', () => {
      test('should be four middleware', () => {
        const engine = new AppRestfulApiServerEngine({
          config: AppRestfulApiServerEngine.config,
          share: AppRestfulApiShare.create({
            env: new EnvironmentFacade({
              environmentHash: {
                CORS_RESTFUL_API_ORIGINS: null,
              },
            })
              .generateFacade(),
          }),
          errorResponseHash: {},
        })

        const expected = [
          expect.any(Function),
          expect.any(Function),
          expect.any(Function),
          expect.any(Function),
        ]

        const received = engine.collectMiddleware()

        expect(received)
          .toEqual(expected)
      })
    })
  })
})

describe('AppRestfulApiServerEngine', () => {
  describe('#collectMiddleware()', () => {
    describe('to allow an origin the share declares', () => {
      const cases = [
        {
          input: {
            origin: 'https://alpha.example',
          },
        },
        {
          input: {
            origin: 'https://beta.example',
          },
        },
      ]

      test.each(cases)('origin: $input.origin', ({ input }) => {
        const engine = new AppRestfulApiServerEngine({
          config: AppRestfulApiServerEngine.config,
          share: AppRestfulApiShare.create({
            env: new EnvironmentFacade({
              environmentHash: {
                CORS_RESTFUL_API_ORIGINS: 'https://alpha.example,https://beta.example',
              },
            })
              .generateFacade(),
          }),
          errorResponseHash: {},
        })

        const [corsMiddleware] = engine.collectMiddleware()
        const mockRequest = MockExpressRequest.create({
          method: 'GET',
          origin: input.origin,
        })
        const mockResponse = MockExpressResponse.create()

        corsMiddleware(mockRequest, mockResponse, () => {})

        expect(mockResponse.getHeader('Access-Control-Allow-Origin'))
          .toBe(input.origin)
      })
    })

    describe('to refuse an origin the share does not declare', () => {
      const cases = [
        {
          input: {
            origin: 'https://gamma.example',
          },
        },
        {
          input: {
            origin: 'http://localhost:3000',
          },
        },
      ]

      test.each(cases)('origin: $input.origin', ({ input }) => {
        const engine = new AppRestfulApiServerEngine({
          config: AppRestfulApiServerEngine.config,
          share: AppRestfulApiShare.create({
            env: new EnvironmentFacade({
              environmentHash: {
                CORS_RESTFUL_API_ORIGINS: 'https://alpha.example',
              },
            })
              .generateFacade(),
          }),
          errorResponseHash: {},
        })

        const [corsMiddleware] = engine.collectMiddleware()
        const mockRequest = MockExpressRequest.create({
          method: 'GET',
          origin: input.origin,
        })
        const mockResponse = MockExpressResponse.create()

        corsMiddleware(mockRequest, mockResponse, () => {})

        expect(mockResponse.getHeader('Access-Control-Allow-Origin'))
          .toBeUndefined()
        expect(mockResponse.getHeader('Vary'))
          .toBe('Origin')
      })
    })

    describe('to refuse every origin when the share declares none', () => {
      const cases = [
        {
          input: {
            origin: 'https://alpha.example',
          },
        },
        {
          input: {
            origin: 'http://localhost:3000',
          },
        },
      ]

      test.each(cases)('origin: $input.origin', ({ input }) => {
        const engine = new AppRestfulApiServerEngine({
          config: AppRestfulApiServerEngine.config,
          share: AppRestfulApiShare.create({
            env: new EnvironmentFacade({
              environmentHash: {
                CORS_RESTFUL_API_ORIGINS: null,
              },
            })
              .generateFacade(),
          }),
          errorResponseHash: {},
        })

        const [corsMiddleware] = engine.collectMiddleware()
        const mockRequest = MockExpressRequest.create({
          method: 'GET',
          origin: input.origin,
        })
        const mockResponse = MockExpressResponse.create()

        corsMiddleware(mockRequest, mockResponse, () => {})

        expect(mockResponse.getHeader('Access-Control-Allow-Origin'))
          .toBeUndefined()
        expect(mockResponse.getHeader('Vary'))
          .toBe('Origin')
      })
    })
  })
})

describe('AppRestfulApiServerEngine', () => {
  describe('#composeExpressMiddleware()', () => {
    describe('should compose the middleware of .get:ExpressMiddleware', () => {
      const cases = [
        {
          input: {
            originsString: 'https://alpha.example',
          },
        },
        {
          input: {
            originsString: null,
          },
        },
      ]

      test.each(cases)('originsString: $input.originsString', ({ input }) => {
        const engine = new AppRestfulApiServerEngine({
          config: AppRestfulApiServerEngine.config,
          share: AppRestfulApiShare.create({
            env: new EnvironmentFacade({
              environmentHash: {
                CORS_RESTFUL_API_ORIGINS: input.originsString,
              },
            })
              .generateFacade(),
          }),
          errorResponseHash: {},
        })

        const received = engine.composeExpressMiddleware()

        expect(received)
          .toEqual([
            expect.any(Function),
          ])
      })
    })
  })
})
