import {
  BaseGraphqlShare,
} from '@openreachtech/renchan'

import AdminGraphqlShare from '../../../../../server/graphql/contexts/AdminGraphqlShare.js'

describe('AdminGraphqlShare', () => {
  describe('super class', () => {
    test('to be defined from BaseGraphqlShare', () => {
      const actual = AdminGraphqlShare.prototype

      expect(actual)
        .toBeInstanceOf(BaseGraphqlShare)
    })
  })
})
