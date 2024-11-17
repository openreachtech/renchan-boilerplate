import {
  RenchanModel,
  ModelAttributeFactory,
} from '@openreachtech/renchan-sequelize'

/**
 * AdminRoleAssignment model.
 */
export default class AdminRoleAssignment extends RenchanModel {
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

      paranoid: true, // for deleted_at column
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
 * @typedef {AdminRoleAssignment & {
 *   id: number
 *   AdminId: number
 *   AdminRoleId: number
 * }} AdminRoleAssignmentEntity
 */
