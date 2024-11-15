import {
  BaseGraphqlServerEngine,
} from '@openreachtech/renchan'

import rootPath from '../../../../app/globals/root-path.js'

import BaseAppGraphqlServerEngine from '../../../../server/graphql/BaseAppGraphqlServerEngine.js'

describe('BaseAppGraphqlServerEngine', () => {
  describe('super class', () => {
    test('to be instance of base class', () => {
      const actual = BaseAppGraphqlServerEngine.prototype

      expect(actual)
        .toBeInstanceOf(BaseGraphqlServerEngine)
    })
  })
})

describe('BaseAppGraphqlServerEngine', () => {
  describe('#collectMiddleware()', () => {
    test('to be fixed value', () => {
      const engine = new BaseAppGraphqlServerEngine({
        config: /** @type {*} */ ({
          staticPath: rootPath.to('public/'),
        }),
        share: /** @type {*} */ ({}),
      })

      const expected = [
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
      ]

      const actual = engine.collectMiddleware()

      expect(actual)
        .toEqual(expected)
    })
  })
})
