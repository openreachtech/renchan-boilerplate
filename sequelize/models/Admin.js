import {
  RenchanModel,
  ModelAttributeFactory,
} from '@openreachtech/renchan-sequelize'

/**
 * Admin model.
 */
export default class Admin extends RenchanModel {
  /** @inheritdoc */
  static createAttributes (DataTypes) {
    const factory = ModelAttributeFactory.create(DataTypes)

    return {
      ...factory.ID_BIGINT,

      username: {
        type: DataTypes.STRING(191),
        allowNull: false,
      },
      registeredAt: {
        type: DataTypes.DATE(3),
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
  static associate () {
    super.associate?.()

    this.hasOne(this._.AdminSecret)
    this.hasOne(this._.AdminPasswordHash)

    this.hasMany(this._.AdminRoleAssignment)

    this.belongsToMany(this._.AdminRole, {
      through: this._.AdminRoleAssignment,
    })
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
 * @typedef {Admin & {
 *   id: number;
 *   username: string;
 * }} AdminEntity
 */
