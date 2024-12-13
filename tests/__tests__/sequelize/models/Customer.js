import Customer from '../../../../sequelize/models/Customer.js'
import CustomerBasic from '../../../../sequelize/models/CustomerBasic.js'
import CustomerPasswordHash from '../../../../sequelize/models/CustomerPasswordHash.js'

describe('Customer', () => {
  describe('.associate()', () => {
    test('to call .hasOne() twice', () => {
      const hasOneSpy = jest.spyOn(Customer, 'hasOne')

      Customer.associate()

      expect(hasOneSpy)
        .toHaveBeenNthCalledWith(1, CustomerBasic)
      expect(hasOneSpy)
        .toHaveBeenNthCalledWith(2, CustomerPasswordHash)
    })
  })
})
