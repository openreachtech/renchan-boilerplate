import {
  RenchanModel,
  ModelAttributeFactory,
} from '@openreachtech/renchan-sequelize'

/**
 * AdminRole model.
 */
export default class AdminRole extends RenchanModel {
  /** @inheritdoc */
  static createAttributes (DataTypes) {
    const factory = ModelAttributeFactory.create(DataTypes)

    return {
      ...factory.ID_INTEGER,

      name: {
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
  static associate () {
    super.associate?.()

    this.belongsToMany(this._.Admin, {
      through: this._.AdminRoleAssignment,
    })
  }

  /** @inheritdoc */
  static defineScopes (Op) {
    super.defineScopes?.(Op)

    // noop
  }

  /** @inheritdoc */
  static setupHooks () {
    super.setupHooks?.()

    // noop
  }

  /** @inheritdoc */
  static defineSubqueries () {
    super.defineSubqueries?.()

    // noop
  }
}

/**
 * @typedef {AdminRole & {
 *   id: number
 *   name: string
 * }} AdminRoleEntity
 */
