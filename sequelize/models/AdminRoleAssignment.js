'use strict'

const {
  RenchanModel,
  ModelAttributeFactory,
} = require('@openreachtech/renchan-sequelize')

class AdminRoleAssignment extends RenchanModel {
  /** @inheritdoc */
  static createAttributes (DataTypes) {
    const factory = ModelAttributeFactory.create(DataTypes)

    return {
      ...factory.ID_BIGINT,

      AdminId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      AdminRoleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    }
  }

  /** @inheritdoc */
  static createOptions (sequelizeClient) {
    return {
      ...super.createOptions(sequelizeClient),
      paranoid: true, // deleted_at カラムがあるため
    }
  }

  /** @inheritdoc */
  static associate (models) {
    super.associate?.()

    this.belongsTo(this._.Admin)
    this.belongsTo(this._.AdminRole)
  }

  /** @inheritdoc */
  static defineScopes (Op) {
    super.defineScopes?.(Op)
    // 必要に応じてスコープを定義
  }

  /** @inheritdoc */
  static setupHooks () {
    super.setupHooks?.()
    // 必要に応じてフックを設定
  }

  /** @inheritdoc */
  static defineSubqueries () {
    super.defineSubqueries?.()
    // 必要に応じてサブクエリを定義
  }
}

module.exports = AdminRoleAssignment

/**
 * @typedef {AdminRoleAssignment & {
 *   id: number;
 *   AdminId: number;
 *   AdminRoleId: number;
 * }} AdminRoleAssignmentEntity
 */
