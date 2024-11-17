import {
  BackupMixinModel,
  RenchanModel,
  ModelAttributeFactory,
} from '@openreachtech/renchan-sequelize'

/**
 * CustomerBasic model.
 */
export default class CustomerBasic extends RenchanModel {
  /** @inheritdoc */
  static createAttributes (DataTypes) {
    const factory = ModelAttributeFactory.create(DataTypes)

    return {
      ...factory.ID_BIGINT,

      CustomerId: {
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
    }
  }

  /** @inheritdoc */
  static associate () {
    super.associate?.()

    this.belongsTo(this._.Customer)
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

  /** @override */
  static get Mixins () {
    return [
      BackupMixinModel,
    ]
  }

  /**
   * get: Backup model for BackupMixinModel
   *
   * @returns {typeof import('./CustomerBasicsBk')} - Backup model declaration
   */
  static get BackupModel () {
    return this._.CustomerBasicsBk
  }
}

/**
 * @typedef {CustomerBasic & {
 *   id: number
 *   CustomerId: number
 *   username: string
 *   savedAt: Date
 * }} CustomerBasicEntity
 */
