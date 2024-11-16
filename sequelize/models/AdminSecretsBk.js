import {
  RenchanModel,
  ModelAttributeFactory,
} from '@openreachtech/renchan-sequelize'

/**
 * AdminSecretBk model.
 */
export default class AdminSecretBk extends RenchanModel {
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

/**
 * @typedef {AdminSecretBk & {
 *   id: number;
 *   AdminId: number;
 *   email: string;
 * }} AdminSecretBkEntity
 */
