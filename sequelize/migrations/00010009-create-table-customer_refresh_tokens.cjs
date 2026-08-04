'use strict'

const MigrationAttributeFactory = require('@openreachtech/renchan-sequelize/lib/tools/MigrationAttributeFactory.cjs')

const TABLE_NAME = 'customer_refresh_tokens'
const COLUMN_NAME = {
  CUSTOMER_ID: 'customer_id',
  TOKEN_HASH: 'token_hash',
  SESSION_KEY: 'session_key',
  USED_AT: 'used_at',
  REVOKED_AT: 'revoked_at',
  GENERATED_AT: 'generated_at',
  EXPIRED_AT: 'expired_at',
}

module.exports = {
  async up (
    queryInterface,
    Sequelize
  ) {
    const factory = MigrationAttributeFactory.create(Sequelize)

    await queryInterface.createTable(TABLE_NAME, {
      ...factory.ID_BIGINT,

      CustomerId: {
        type: Sequelize.BIGINT,
        field: COLUMN_NAME.CUSTOMER_ID,
        allowNull: false,
      },
      tokenHash: {
        type: Sequelize.STRING(191),
        field: COLUMN_NAME.TOKEN_HASH,
        allowNull: false,
      },
      sessionKey: {
        type: Sequelize.STRING(191),
        field: COLUMN_NAME.SESSION_KEY,
        allowNull: false,
      },
      usedAt: {
        type: Sequelize.DATE(3),
        field: COLUMN_NAME.USED_AT,
        allowNull: true,
      },
      revokedAt: {
        type: Sequelize.DATE(3),
        field: COLUMN_NAME.REVOKED_AT,
        allowNull: true,
      },
      generatedAt: {
        type: Sequelize.DATE(3),
        field: COLUMN_NAME.GENERATED_AT,
        allowNull: false,
      },
      expiredAt: {
        type: Sequelize.DATE(3),
        field: COLUMN_NAME.EXPIRED_AT,
        allowNull: false,
      },
      ...factory.TIMESTAMPS_WITH_DELETED_AT,
    })

    await Promise.all([
      queryInterface.addIndex(TABLE_NAME, [
        COLUMN_NAME.TOKEN_HASH,
      ], {
        name: [
          TABLE_NAME,
          COLUMN_NAME.TOKEN_HASH,
          'unique',
        ].join('_'),
        unique: true,
      }),
      queryInterface.addIndex(TABLE_NAME, [
        COLUMN_NAME.SESSION_KEY,
      ], {
        name: [
          TABLE_NAME,
          COLUMN_NAME.SESSION_KEY,
          'index',
        ].join('_'),
      }),
      queryInterface.addIndex(TABLE_NAME, [
        COLUMN_NAME.CUSTOMER_ID,
      ], {
        name: [
          TABLE_NAME,
          COLUMN_NAME.CUSTOMER_ID,
          'index',
        ].join('_'),
      }),
    ])

    return Promise.resolve()
  },

  async down (
    queryInterface,
    Sequelize
  ) {
    return queryInterface.dropTable(TABLE_NAME)
  },
}
