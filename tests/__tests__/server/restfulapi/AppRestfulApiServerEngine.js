import {
  rootPath,
} from '../../../../app/globals/_.js'

import AppRestfulApiServerEngine from '../../../../server/restfulapi/AppRestfulApiServerEngine.js'

import AppRestfulApiShare from '../../../../server/restfulapi/contexts/AppRestfulApiShare.js'

import AllowedCorsOriginCollection from '../../../../server/tools/AllowedCorsOriginCollection.js'

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
            allowedCorsOriginCollection: AllowedCorsOriginCollection.create({
              originsString: 'https://alpha.example,https://beta.example',
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
            allowedCorsOriginCollection: AllowedCorsOriginCollection.create({
              originsString: 'https://alpha.example',
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
            allowedCorsOriginCollection: AllowedCorsOriginCollection.create({
              originsString: null,
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
