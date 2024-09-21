'use strict'

const sequelizeActivator = require('../../../../sequelize/activatedModels')

describe('validate models', () => {
  const table = Object.values(sequelizeActivator.modelHash)
    .map(Model => ({
      Model,
    }))

  test.each(table)('Model: $Model.name', async ({ Model }) => {
    await expect(Model.findOne())
      .resolves
      .not.toThrowError()
  })
})
