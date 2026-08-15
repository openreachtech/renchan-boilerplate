import {
  BaseRestfulApiServerEngine,
} from '@openreachtech/renchan'

import AppRestfulApiServerEngine from '../../../../server/restfulapi/AppRestfulApiServerEngine.js'

describe('AppRestfulApiServerEngine', () => {
  describe('super class', () => {
    test('to be instance of base class', () => {
      const actual = AppRestfulApiServerEngine.prototype

      expect(actual)
        .toBeInstanceOf(BaseRestfulApiServerEngine)
    })
  })
})

describe('AppRestfulApiServerEngine', () => {
  describe('#extractCorsAllowedOrigins()', () => {
    describe('to parse the allowlist from the share env', () => {
      const cases = [
        {
          factoryParams: {
            share: {
              env: {
                CORS_ALLOWED_ORIGINS: 'https://app.example.com',
              },
            },
          },
          expected: [
            'https://app.example.com',
          ],
        },
        {
          factoryParams: {
            share: {
              env: {
                CORS_ALLOWED_ORIGINS: 'https://one.example.com, https://two.example.com ,',
              },
            },
          },
          expected: [
            'https://one.example.com',
            'https://two.example.com',
          ],
        },
      ]

      test.each(cases)('CORS_ALLOWED_ORIGINS: $factoryParams.share.env.CORS_ALLOWED_ORIGINS', ({
        factoryParams,
        expected,
      }) => {
        const engine = AppRestfulApiServerEngine.create(factoryParams)

        const actual = engine.extractCorsAllowedOrigins()

        expect(actual)
          .toEqual(expected)
      })
    })

    describe('to be an empty allowlist when no origin is configured', () => {
      const cases = [
        {
          factoryParams: {
            share: {
              env: {
                CORS_ALLOWED_ORIGINS: '',
              },
            },
          },
        },
        {
          factoryParams: {
            share: {
              env: {
                CORS_ALLOWED_ORIGINS: '  ',
              },
            },
          },
        },
      ]

      test.each(cases)('CORS_ALLOWED_ORIGINS: "$factoryParams.share.env.CORS_ALLOWED_ORIGINS"', ({
        factoryParams,
      }) => {
        const engine = AppRestfulApiServerEngine.create(factoryParams)

        const actual = engine.extractCorsAllowedOrigins()

        expect(actual)
          .toHaveLength(0)
      })
    })
  })
})

describe('AppRestfulApiServerEngine', () => {
  describe('#buildCorsOptions()', () => {
    describe('to allow credentials with the allowlisted origins', () => {
      const cases = [
        {
          factoryParams: {
            share: {
              env: {
                CORS_ALLOWED_ORIGINS: 'https://app.example.com',
              },
            },
          },
          expected: {
            origin: [
              'https://app.example.com',
            ],
            credentials: true,
          },
        },
        {
          factoryParams: {
            share: {
              env: {
                CORS_ALLOWED_ORIGINS: 'https://a.example.com, https://b.example.com',
              },
            },
          },
          expected: {
            origin: [
              'https://a.example.com',
              'https://b.example.com',
            ],
            credentials: true,
          },
        },
      ]

      test.each(cases)('CORS_ALLOWED_ORIGINS: $factoryParams.share.env.CORS_ALLOWED_ORIGINS', ({
        factoryParams,
        expected,
      }) => {
        const engine = AppRestfulApiServerEngine.create(factoryParams)

        const actual = engine.buildCorsOptions()

        expect(actual)
          .toEqual(expected)
      })
    })
  })
})
