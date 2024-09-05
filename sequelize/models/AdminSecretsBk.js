'use strict'

const {
  RenchanModel,
  ModelAttributeFactory,
} = require('@openreachtech/renchan-sequelize')

class AdminSecretBk extends RenchanModel {
  /** @inheritdoc */
  static createAttributes (DataTypes) {
    const factory = ModelAttributeFactory.create(DataTypes)

    return {
      ...factory.ID_BIGINT,

      AdminId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(191),
        allowNull: false,
      },
    }
  }

  /** @inheritdoc */
  static createOptions (sequelizeClient) {
    return {
      ...super.createOptions(sequelizeClient),
      tableName: 'admin_secrets_bk',
    }
  }

  /** @inheritdoc */
  static associate (models) {
    super.associate?.()
    // バックアップテーブルなので、通常は関連を定義しません
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

module.exports = AdminSecretBk

/**
 * @typedef {AdminSecretBk & {
 *   id: number;
 *   AdminId: number;
 *   email: string;
 * }} AdminSecretBkEntity
 */
