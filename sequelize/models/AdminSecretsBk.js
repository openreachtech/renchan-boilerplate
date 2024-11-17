import {
  RenchanModel,
  ModelAttributeFactory,
} from '@openreachtech/renchan-sequelize'

/**
 * AdminSecretsBk model.
 */
export default class AdminSecretsBk extends RenchanModel {
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
  static associate () {
    super.associate?.()

    // noop
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
 * @typedef {AdminSecretsBk & {
 *   id: number
 *   AdminId: number
 *   email: string
 *   savedAt: Date
 * }} AdminSecretsBkEntity
 */
