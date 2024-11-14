import {
  BaseGraphqlServerEngine,
} from '@openreachtech/renchan'

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
    test('to be fixed value', async () => {
      const engine = await BaseAppGraphqlServerEngine.createAsync()

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
