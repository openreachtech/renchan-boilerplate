import {
  BaseGraphqlContext,
} from '@openreachtech/renchan'

import BaseAppGraphqlContext from '../../../../../server/graphql/contexts/BaseAppGraphqlContext.js'

describe('BaseAppGraphqlContext', () => {
  describe('super class', () => {
    test('to be instance of BaseGraphqlContext', () => {
      const actual = BaseAppGraphqlContext.prototype

      expect(actual)
        .toBeInstanceOf(BaseGraphqlContext)
    })
  })
})

describe('BaseAppGraphqlContext', () => {
  describe('#get:config', () => {
    test('should be the engine config', () => {
      const config = /** @type {*} */ ({
        graphqlEndpoint: '/graphql-test',
        refreshTokenCookie: {
          name: 'test_refresh_token',
          lifetimeDays: 14,
          secure: true,
          sameSite: 'lax',
          httpOnly: true,
        },
      })

      const context = BaseAppGraphqlContext.create(/** @type {*} */ ({
        expressRequest: {},
        requestParams: {},
        engine: {
          config,
        },
        userEntity: null,
        visa: {},
      }))

      const actual = context.config

      expect(actual)
        .toBe(config) // same reference
    })
  })
})

describe('BaseAppGraphqlContext', () => {
  describe('#get:cookieHeader', () => {
    describe('should read the Cookie header of the request', () => {
      const cases = [
        {
          params: {
            cookieHeader: 'test_refresh_token=token-0001',
          },
          expected: 'test_refresh_token=token-0001',
        },
        {
          params: {
            cookieHeader: 'other=1; another=2',
          },
          expected: 'other=1; another=2',
        },
      ]

      test.each(cases)('cookieHeader: $params.cookieHeader', ({ params, expected }) => {
        const context = BaseAppGraphqlContext.create(/** @type {*} */ ({
          expressRequest: {
            headers: {
              cookie: params.cookieHeader,
            },
          },
          requestParams: {},
          engine: {
            config: {},
          },
          userEntity: null,
          visa: {},
        }))

        const actual = context.cookieHeader

        expect(actual)
          .toBe(expected)
      })
    })

    describe('should answer null when the header is absent', () => {
      test('to be null when the request carries no cookie header', () => {
        const context = BaseAppGraphqlContext.create(/** @type {*} */ ({
          expressRequest: {
            headers: {},
          },
          requestParams: {},
          engine: {
            config: {},
          },
          userEntity: null,
          visa: {},
        }))

        const actual = context.cookieHeader

        expect(actual)
          .toBeNull()
      })
    })
  })
})

describe('BaseAppGraphqlContext', () => {
  describe('#get:expressResponse', () => {
    describe('should reach the express response through the graphql-http request', () => {
      test('to be the response carried at request.context.res', () => {
        // renchan hands a context only the request. The express adapter of graphql-http builds
        // that request as { raw, context: { res } }, which is the only route to the response.
        const expressResponse = /** @type {*} */ ({ marker: 'response' })

        const context = BaseAppGraphqlContext.create(/** @type {*} */ ({
          expressRequest: {
            context: {
              res: expressResponse,
            },
          },
          requestParams: {},
          engine: {
            config: {},
          },
          userEntity: null,
          visa: {},
        }))

        const actual = context.expressResponse

        expect(actual)
          .toBe(expressResponse) // same reference
      })
    })

    describe('should answer null outside an HTTP request', () => {
      test('to be null when the request carries no response', () => {
        const context = BaseAppGraphqlContext.create(/** @type {*} */ ({
          expressRequest: {},
          requestParams: {},
          engine: {
            config: {},
          },
          userEntity: null,
          visa: {},
        }))

        const actual = context.expressResponse

        expect(actual)
          .toBeNull()
      })
    })
  })
})
