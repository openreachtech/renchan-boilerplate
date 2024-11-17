import CustomerPasswordHash from '../../../../sequelize/models/CustomerPasswordHash.js'

describe('CustomerPasswordHash', () => {
  describe('#verifyPassword()', () => {
    const cases = [
      {
        params: {
          customerId: 100001,
          passwordHash: '$2b$10$o9yXSMh.EOXHx4DKRLfOrefEE3yPJkZOoCwkas/2VsBRui.q2/62C',
          savedAt: new Date('2024-01-21T00:00:00.000Z'),
        },
        truthyCases: [
          { password: 'pAsswOrd$01' },
        ],
        falsyCases: [
          { password: 'pAsswOrd$02' },
          { password: 'error$01' },
        ],
      },
      {
        params: {
          customerId: 100002,
          passwordHash: '$2b$10$lg7Z/5JknSlVGS62Y5rGs.HQLX8yv2T1l8Hy0GHiMgoGNVY49GDsO',
          savedAt: new Date('2024-01-22T00:00:00.000Z'),
        },
        truthyCases: [
          { password: 'pAsswOrd$02' },
        ],
        falsyCases: [
          { password: 'pAsswOrd$03' },
          { password: 'error$02' },
        ],
      },
      {
        params: {
          customerId: 100003,
          passwordHash: '$2b$10$d1bAWw6YaZScZVwJlLLkG.EMlliSMhQFPyDAHqsdf2.G5onCx9XjS',
          savedAt: new Date('2024-01-23T00:00:00.000Z'),
        },
        truthyCases: [
          { password: 'pAsswOrd$03' },
        ],
        falsyCases: [
          { password: 'pAsswOrd$04' },
          { password: 'error$03' },
        ],
      },
    ]

    describe.each(cases)('customerId: $params.customerId', ({ params, truthyCases, falsyCases }) => {
      const customerPasswordHash = CustomerPasswordHash.build(params)

      describe('to be truthy', () => {
        test.each(truthyCases)('password: $password', async ({ password }) => {
          const result = await customerPasswordHash.verifiesPassword({ password })

          expect(result)
            .toBeTruthy()
        })
      })

      describe('to be falsy', () => {
        test.each(falsyCases)('password: $password', async ({ password }) => {
          const result = await customerPasswordHash.verifiesPassword({ password })

          expect(result)
            .toBeFalsy()
        })
      })
    })
  })
})
