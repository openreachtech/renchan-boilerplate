// @ts-check
'use strict'

const models = require('../../../../sequelize/activatedModels')

describe('validate models', () => {
  test.each(
    Object.values(models)
      .map(model => ({ model }))
  )('$model.name', async ({ model }) => {
    await expect(model.findOne())
      .resolves
      .not
      .toThrowError()
  })
})
