import {
  RenchanModel,
} from '@openreachtech/renchan-sequelize'

import AdminPasswordHash from '../../../../sequelize/models/AdminPasswordHash.js'

describe('AdminPasswordHash', () => {
  describe('super class', () => {
    test('to be instance of RenchanModel', () => {
      const received = AdminPasswordHash.prototype

      expect(received)
        .toBeInstanceOf(RenchanModel)
    })
  })
})

describe('AdminPasswordHash', () => {
  describe('#verifiesPassword()', () => {
    describe('when the password matches the hash', () => {
      const cases = [
        {
          factoryParams: {
            passwordHash: '$2b$10$o9yXSMh.EOXHx4DKRLfOrefEE3yPJkZOoCwkas/2VsBRui.q2/62C', // bcrypt of pAsswOrd$01
          },
          params: {
            password: 'pAsswOrd$01',
          },
        },
        {
          factoryParams: {
            passwordHash: '$2b$10$lg7Z/5JknSlVGS62Y5rGs.HQLX8yv2T1l8Hy0GHiMgoGNVY49GDsO', // bcrypt of pAsswOrd$02
          },
          params: {
            password: 'pAsswOrd$02',
          },
        },
      ]

      test.each(cases)('password: $params.password', async ({
        factoryParams,
        params,
      }) => {
        const adminPasswordHash = AdminPasswordHash.build(factoryParams)

        const received = await adminPasswordHash.verifiesPassword(params)

        expect(received)
          .toBeTruthy()
      })
    })

    describe('when the password does not match the hash', () => {
      const cases = [
        {
          factoryParams: {
            passwordHash: '$2b$10$o9yXSMh.EOXHx4DKRLfOrefEE3yPJkZOoCwkas/2VsBRui.q2/62C', // bcrypt of pAsswOrd$01
          },
          params: {
            password: 'wrongPassword$01',
          },
        },
        {
          factoryParams: {
            passwordHash: '$2b$10$lg7Z/5JknSlVGS62Y5rGs.HQLX8yv2T1l8Hy0GHiMgoGNVY49GDsO', // bcrypt of pAsswOrd$02
          },
          params: {
            password: 'wrongPassword$02',
          },
        },
      ]

      test.each(cases)('password: $params.password', async ({
        factoryParams,
        params,
      }) => {
        const adminPasswordHash = AdminPasswordHash.build(factoryParams)

        const received = await adminPasswordHash.verifiesPassword(params)

        expect(received)
          .toBeFalsy()
      })
    })

    describe('when no password hash is set', () => {
      const cases = [
        {
          params: {
            password: 'pAsswOrd$01',
          },
        },
        {
          params: {
            password: 'pAsswOrd$02',
          },
        },
      ]

      test.each(cases)('password: $params.password', async ({
        params,
      }) => {
        const adminPasswordHash = AdminPasswordHash.build({})

        const received = await adminPasswordHash.verifiesPassword(params)

        expect(received)
          .toBeFalsy()
      })
    })
  })
})
