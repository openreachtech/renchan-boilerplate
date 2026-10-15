import {
  BaseGraphqlShare,
} from '@openreachtech/renchan'

import CustomerGraphqlShare from '../../../../../server/graphql/contexts/CustomerGraphqlShare.js'

describe('CustomerGraphqlShare', () => {
  describe('super class', () => {
    test('to be defined from BaseGraphqlShare', () => {
      const actual = CustomerGraphqlShare.prototype

      expect(actual)
        .toBeInstanceOf(BaseGraphqlShare)
    })
  })
})
