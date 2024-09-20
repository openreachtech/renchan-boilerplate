'use strict'

const {
  Op,
} = require('sequelize')

const {
  graphql: {
    BaseResolver,
  },
} = require('@openreachtech/renchan')

const Admin = require('../../../../../sequelize/models/Admin')
const AdminSecret = require('../../../../../sequelize/models/AdminSecret')
const AdminRole = require('../../../../../sequelize/models/AdminRole')

class AdminsQueryResolver extends BaseResolver {
  /**
   * Resolve the admins query
   *
   * @param {object} _
   * @param {import('../../../contexts/AdminContext')} context
   * @returns {Promise<AdminsResult>}
   */
  async resolve (
    _,
    context
  ) {
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

  /** @inheritdoc */
  get schema () {
    return 'admins'
  }
}

module.exports = AdminsQueryResolver

/**
 * @typedef {import('../../../../../types/main').AdminWithAssociationsEntity} AdminWithAssociationsEntity
 * @typedef {import('../../../../../types/main').AdminsResult} AdminsResult
 */
