import {
  RenchanModel,
  ModelAttributeFactory,
} from '@openreachtech/renchan-sequelize'

/**
 * CustomerPasswordHashesBk model.
 */
export default class CustomerPasswordHashesBk extends RenchanModel {
  /** @inheritdoc */
  static createAttributes (DataTypes) {
    const factory = ModelAttributeFactory.create(DataTypes)

    return {
      ...factory.ID_BIGINT,

      CustomerId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      passwordHash: {
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
      tableName: 'customer_password_hashes_bk',
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

/**
 * @typedef {CustomerPasswordHashesBk & {
 *   id: number
 *   CustomerId: number
 *   passwordHash: string
 *   savedAt: Date
 * }} CustomerPasswordHashesBkEntity
 */
