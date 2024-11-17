import {
  Op,
} from 'sequelize'

import {
  BaseQueryResolver,
} from '@openreachtech/renchan'

import Admin from '../../../../../sequelize/models/Admin.js'
import AdminSecret from '../../../../../sequelize/models/AdminSecret.js'
import AdminRole from '../../../../../sequelize/models/AdminRole.js'

export default class AdminsQueryResolver extends BaseQueryResolver {
  /** @override */
  static get schema () {
    return 'admins'
  }

  /**
   * Resolve the admins query
   *
   * @param {{
   *   context: renchan.GraphqlContext
   * }} params - Parameters.
   * @returns {Promise<AdminsResult>}
   */
  async resolve ({
    context,
  }) {
    const admins = await this.findAdmins({
      adminId: context.admin.id,
    })

    return this.formatResponse({
      admins,
    })
  }

  /**
   * Find all admins except the current admin
   *
   * @param {{
   *   adminId: number
   * }} params
   * @returns {Promise<Array<AdminWithAssociationsEntity>>}
   */
  async findAdmins ({
    adminId,
  }) {
    return /** @type {Promise<*>} */ (
      Admin.findAll({
        where: {
          id: {
            [Op.ne]: adminId,
          },
        },
        include: [
          AdminSecret,
          AdminRole,
        ],
        order: [
          ['registeredAt', 'DESC'],
        ],
      })
    )
  }

  /**
   * Format the response
   *
   * @param {{
   *   admins: Array<AdminWithAssociationsEntity>
   * }} params
   * @returns {AdminsResult}
   */
  formatResponse ({
    admins,
  }) {
    return {
      admins: admins.map(admin => ({
        adminId: admin.id,
        username: admin.username,
        email: admin.AdminSecret.email,
        roles: admin.AdminRoles.map(role => ({
          roleId: role.id,
          roleName: role.name,
        })),
      })),
    }
  }
}
