import {
  rootPath,
} from '../../../../app/globals/_.js'

import AppRestfulApiServerEngine from '../../../../server/restfulapi/AppRestfulApiServerEngine.js'

import AppRestfulApiShare from '../../../../server/restfulapi/contexts/AppRestfulApiShare.js'

import AppRestfulApiCorsExpressMiddleware from '../../../../server/middleware/AppRestfulApiCorsExpressMiddleware.js'

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
          config: /** @type {*} */ ({
            staticPath: rootPath.to('public/'),
          }),
          share: AppRestfulApiShare.create({
            env: /** @type {*} */ ({
              CORS_RESTFUL_API_ORIGINS: null,
            }),
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
          config: /** @type {*} */ ({
            staticPath: rootPath.to('public/'),
          }),
          share: AppRestfulApiShare.create({
            env: /** @type {*} */ ({
              CORS_RESTFUL_API_ORIGINS: 'https://alpha.example,https://beta.example',
            }),
          }),
          errorResponseHash: {},
        })

        const [corsMiddleware] = engine.collectMiddleware()

        const requestMock = /** @type {*} */ ({
          method: 'GET',
          headers: {
            origin: input.origin,
          },
        })
        const responseMock = /** @type {*} */ ({
          getHeader: jest.fn(),
          setHeader: jest.fn(),
        })
        const nextMock = jest.fn()

        corsMiddleware(requestMock, responseMock, nextMock)

        expect(responseMock.setHeader)
          .toHaveBeenCalledWith('Access-Control-Allow-Origin', input.origin)
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
          config: /** @type {*} */ ({
            staticPath: rootPath.to('public/'),
          }),
          share: AppRestfulApiShare.create({
            env: /** @type {*} */ ({
              CORS_RESTFUL_API_ORIGINS: 'https://alpha.example',
            }),
          }),
          errorResponseHash: {},
        })

        const [corsMiddleware] = engine.collectMiddleware()

        const requestMock = /** @type {*} */ ({
          method: 'GET',
          headers: {
            origin: input.origin,
          },
        })
        const responseMock = /** @type {*} */ ({
          getHeader: jest.fn(),
          setHeader: jest.fn(),
        })
        const nextMock = jest.fn()

        corsMiddleware(requestMock, responseMock, nextMock)

        expect(responseMock.setHeader)
          .toHaveBeenCalledTimes(1)
        expect(responseMock.setHeader)
          .toHaveBeenCalledWith('Vary', 'Origin')
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
          config: /** @type {*} */ ({
            staticPath: rootPath.to('public/'),
          }),
          share: AppRestfulApiShare.create({
            env: /** @type {*} */ ({
              CORS_RESTFUL_API_ORIGINS: null,
            }),
          }),
          errorResponseHash: {},
        })

        const [corsMiddleware] = engine.collectMiddleware()

        const requestMock = /** @type {*} */ ({
          method: 'GET',
          headers: {
            origin: input.origin,
          },
        })
        const responseMock = /** @type {*} */ ({
          getHeader: jest.fn(),
          setHeader: jest.fn(),
        })
        const nextMock = jest.fn()

        corsMiddleware(requestMock, responseMock, nextMock)

        expect(responseMock.setHeader)
          .toHaveBeenCalledTimes(1)
        expect(responseMock.setHeader)
          .toHaveBeenCalledWith('Vary', 'Origin')
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
          config: /** @type {*} */ ({
            staticPath: rootPath.to('public/'),
          }),
          share: AppRestfulApiShare.create({
            env: /** @type {*} */ ({
              CORS_RESTFUL_API_ORIGINS: input.originsString,
            }),
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
