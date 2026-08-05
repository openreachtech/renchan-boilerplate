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
    describe('to be the engine config', () => {
      const cases = [
        {
          params: {
            config: /** @type {*} */ ({ label: 'alpha' }),
          },
        },
        {
          params: {
            config: /** @type {*} */ ({ label: 'beta' }),
          },
        },
      ]

      test.each(cases)('config: $params.config.label', ({ params }) => {
        const context = BaseAppGraphqlContext.create(/** @type {*} */ ({
          expressRequest: {},
          requestParams: {},
          engine: {
            config: params.config,
          },
          userEntity: null,
          visa: {},
        }))

        const actual = context.config

        expect(actual)
          .toBe(params.config) // same reference
      })
    })
  })
})

describe('BaseAppGraphqlContext', () => {
  describe('#get:cookieHeader', () => {
    describe('to read the Cookie header of the request', () => {
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

    describe('to be null when the header is absent', () => {
      test('should be null when the request carries no cookie header', () => {
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
    describe('to reach the response through the graphql-http request', () => {
      // renchan hands a context only the request. The express adapter of graphql-http builds that
      // request as { raw, context: { res } }, which is the only route to the response.
      const cases = [
        {
          params: {
            expressResponse: /** @type {*} */ ({ label: 'alpha' }),
          },
        },
        {
          params: {
            expressResponse: /** @type {*} */ ({ label: 'beta' }),
          },
        },
      ]

      test.each(cases)('expressResponse: $params.expressResponse.label', ({ params }) => {
        const context = BaseAppGraphqlContext.create(/** @type {*} */ ({
          expressRequest: {
            context: {
              res: params.expressResponse,
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
          .toBe(params.expressResponse) // same reference
      })
    })

    describe('to be null outside an HTTP request', () => {
      test('should be null when the request carries no response', () => {
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
