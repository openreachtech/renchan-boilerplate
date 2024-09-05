'use strict'

const {
  RenchanModel,
  ModelAttributeFactory,
  BackupMixinModel,
} = require('@openreachtech/renchan-sequelize')

class AdminPasswordHash extends RenchanModel {
  /** @inheritdoc */
  static createAttributes (DataTypes) {
    const factory = ModelAttributeFactory.create(DataTypes)

    return {
      ...factory.ID_BIGINT,

      passwordHash: {
        type: DataTypes.STRING(191),
        allowNull: false,
      },
    }
  }

  /** @inheritdoc */
  static createOptions (sequelizeClient) {
    return {
      ...super.createOptions(sequelizeClient),
    }
  }

  /** @inheritdoc */
  static associate (models) {
    super.associate?.()

    this.belongsTo(this._.Admin)
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

  /** @override */
  static get Mixins () {
    return [
      BackupMixinModel,
    ]
  }

  /**
   * get: Backup model for BackupMixinModel
   *
   * @returns {typeof import('./AdminPasswordHashBk')} - Backup model declaration
   */
  static get BackupModel () {
    return this._.AdminPasswordHashBk
  }
}

module.exports = AdminPasswordHash

/**
 * @typedef {AdminPasswordHash & {
 *   id: number;
 *   AdminId: number;
 *   passwordHash: string;
 * }} AdminPasswordHashEntity
 */
