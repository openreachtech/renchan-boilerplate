import {
  RenchanModel,
} from '@openreachtech/renchan-sequelize'

import AdminSecret from '../../../../sequelize/models/AdminSecret.js'
import Admin from '../../../../sequelize/models/Admin.js'
import AdminPasswordHash from '../../../../sequelize/models/AdminPasswordHash.js'

describe('AdminSecret', () => {
  describe('super class', () => {
    test('to be instance of RenchanModel', () => {
      const received = AdminSecret.prototype

      expect(received)
        .toBeInstanceOf(RenchanModel)
    })
  })
})

describe('AdminSecret', () => {
  describe('#get:passwordHashEntity', () => {
    describe('when the Admin association is loaded', () => {
      const cases = [
        {
          params: {
            email: 'admin.getter-01@example.com',
            Admin: {
              AdminPasswordHash: {
                AdminId: 100001,
                passwordHash: 'fake-hash-value-01',
                savedAt: new Date('2024-01-01T00:00:01.001Z'),
              },
            },
          },
        },
        {
          params: {
            email: 'admin.getter-02@example.com',
            Admin: {
              AdminPasswordHash: {
                AdminId: 100002,
                passwordHash: 'fake-hash-value-02',
                savedAt: new Date('2024-01-02T00:00:02.002Z'),
              },
            },
          },
        },
      ]

      test.each(cases)('email: $params.email', ({ params }) => {
        const adminSecret = AdminSecret.build(
          params,
          {
            include: [
              {
                model: Admin,
                include: [
                  AdminPasswordHash,
                ],
              },
            ],
          }
        )

        const received = adminSecret.passwordHashEntity

        expect(received)
          .toBe(adminSecret.Admin.AdminPasswordHash) // same reference
      })
    })

    describe('when the association is not loaded', () => {
      const cases = [
        {
          params: {
            email: 'admin.getter-03@example.com',
          },
        },
        {
          params: {
            email: 'admin.getter-04@example.com',
          },
        },
      ]

      test.each(cases)('email: $params.email', ({ params }) => {
        const adminSecret = AdminSecret.build(params)

        const received = adminSecret.passwordHashEntity

        expect(received)
          .toBeNull()
      })
    })
  })
})
