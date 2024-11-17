import {
  RenchanModel,
  ModelAttributeFactory,
} from '@openreachtech/renchan-sequelize'

/**
 * CustomerBasicsBk model.
 */
export default class CustomerBasicsBk extends RenchanModel {
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

      tableName: 'customer_basics_bk',
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
}

/**
 * @typedef {CustomerBasicsBk & {
 *   id: number
 *   CustomerId: number
 *   username: string
 *   savedAt: Date
 * }} CustomerBasicsBkEntity
 */
