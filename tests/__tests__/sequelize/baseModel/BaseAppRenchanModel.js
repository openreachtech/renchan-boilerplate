import {
  RenchanModel,
} from '@openreachtech/renchan-sequelize'

import BaseAppRenchanModel from '../../../../sequelize/baseModel/BaseAppRenchanModel.js'

describe('BaseAppRenchanModel', () => {
  describe('super class', () => {
    test('to be instance of base class', () => {
      const actual = BaseAppRenchanModel.prototype

      expect(actual)
        .toBeInstanceOf(RenchanModel)
    })
  })
})
