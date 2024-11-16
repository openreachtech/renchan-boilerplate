import {
  BackupMixinModel,
  RenchanModel,
  ModelAttributeFactory,
} from '@openreachtech/renchan-sequelize'

/**
 * AdminBasicsBk model.
 */
export default class AdminBasicsBk extends RenchanModel {
  /** @inheritdoc */
  static createAttributes (DataTypes) {
    const factory = ModelAttributeFactory.create(DataTypes)

    return {
      ...factory.ID_BIGINT,

      AdminId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING(191),
        allowNull: false,
      },
      savedAt: {
        type: DataTypes.DATE(3),
        allowNull: false,
      },
    }
  }

  /** @inheritdoc */
  static createOptions (sequelizeClient) {
    return {
      ...super.createOptions(sequelizeClient),
      tableName: 'admin_basics_bk',
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
   * @returns {typeof import('./AdminBasicsBk')} - Backup model declaration
   */
  static get BackupModel () {
    return this._.AdminBasicsBk
  }
}

/**
 * @typedef {AdminBasicsBk & {
 *   id: number
 *   AdminId: number
 *   username: string
 *   savedAt: Date
 * }} AdminBasicsBkEntity
 */
