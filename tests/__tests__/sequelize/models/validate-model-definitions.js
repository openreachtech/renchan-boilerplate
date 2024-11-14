describe('Model', () => {
  const table = Object.values(globalThis.sequelizeActivator.modelHash)
    .map(Model => ({
      Model,
    }))

  test.each(table)('Model: $Model.name', async ({ Model }) => {
    await expect(Model.findOne())
      .resolves
      .not.toThrow()
  })
})
