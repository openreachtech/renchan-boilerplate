import {
  rootPath,
} from '../../../../app/globals/_.js'

import AppRestfulApiServerEngine from '../../../../server/restfulapi/AppRestfulApiServerEngine.js'

describe('AppRestfulApiServerEngine', () => {
  describe('.get:allowedOrigins', () => {
    describe('to be the origins the environment declares', () => {
      test('should be the development origin', () => {
        const expected = [
          'http://localhost:3000',
        ]

        const actual = AppRestfulApiServerEngine.allowedOrigins

        expect(actual)
          .toEqual(expected)
      })
    })
  })
})

describe('AppRestfulApiServerEngine', () => {
  describe('#collectMiddleware()', () => {
    describe('to allow an origin the config declares', () => {
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
            allowedOrigins: [
              'https://alpha.example',
              'https://beta.example',
            ],
          }),
          share: /** @type {*} */ ({}),
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

    describe('to refuse an origin the config does not declare', () => {
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
            allowedOrigins: [
              'https://alpha.example',
            ],
          }),
          share: /** @type {*} */ ({}),
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

    describe('to refuse every origin when the config declares none', () => {
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
            allowedOrigins: [],
          }),
          share: /** @type {*} */ ({}),
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
