import {
  BaseQueryResolver,
} from '@openreachtech/renchan'

export default class AdminsQueryResolver extends BaseQueryResolver {
  /** @override */
  static get schema () {
    return 'admins'
  }

  /**
   * Resolve the admins query
   *
   * @param {*} params - Parameters.
   * @returns {Promise<AdminsResult>}
   */
  async resolve ({
    context,
  }) {
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
}
