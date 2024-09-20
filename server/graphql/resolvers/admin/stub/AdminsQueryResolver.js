'use strict'

const {
  graphql: {
    BaseResolver,
  },
} = require('@openreachtech/renchan')

class AdminsQueryResolver extends BaseResolver {
  /** @inheritdoc */
  async resolve () {
    return {
      admins: [
        {
          adminId: 1,
          username: 'admin1',
          email: 'admin1@example.com',
          roles: [
            {
              roleId: 1,
              roleName: 'Super Admin',
            },
          ],
        },
        {
          adminId: 2,
          username: 'admin2',
          email: 'admin2@example.com',
          roles: [
            {
              roleId: 2,
              roleName: 'Content Manager',
            },
          ],
        },
      ],
    }
  }

  /** @inheritdoc */
  get schema () {
    return 'admins'
  }
}

module.exports = AdminsQueryResolver
