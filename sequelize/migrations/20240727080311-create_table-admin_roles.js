'use strict'

const {
  MigrationAttributeFactory,
} = require('@openreachtech/renchan').sequelize

const TABLE_NAME = 'admin_roles'
const COLUMN_NAME = {
  NAME: 'name',
}

module.exports = {
  async up (
    queryInterface,
    Sequelize
  ) {
    const factory = MigrationAttributeFactory.create(Sequelize)

    return queryInterface.createTable(
      TABLE_NAME,
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: Sequelize.STRING(191),
          field: COLUMN_NAME.NAME,
          allowNull: false,
        },

        ...factory.TIMESTAMPS,
      }
    )
  },

  async down (
    queryInterface,
    Sequelize
  ) {
    return queryInterface.dropTable(TABLE_NAME)
  },
}
