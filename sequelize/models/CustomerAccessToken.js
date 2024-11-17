import {
  RenchanModel,
  ModelAttributeFactory,
} from '@openreachtech/renchan-sequelize'

/**
 * CustomerAccessToken model.
 */
export default class CustomerAccessToken extends RenchanModel {
  /** @inheritdoc */
  static createAttributes (DataTypes) {
    const factory = ModelAttributeFactory.create(DataTypes)

    return {
      ...factory.ID_BIGINT,

      // ForeignKey must start with upper case.
      CustomerId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      accessToken: {
        type: DataTypes.STRING(191),
        allowNull: false,
      },
      generatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      expiredAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    }
  }

  /** @inheritdoc */
  static createOptions (sequelizeClient) {
    return {
      ...super.createOptions(sequelizeClient),
    }

    // noop
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
 * @typedef {CustomerAccessToken & {
 *   CustomerId: number
 *   accessToken: string
 *   generatedAt: Date
 *   expiredAt: Date
 * }} CustomerAccessTokenEntity
 */

/**
 * @typedef {CustomerAccessTokenEntity & {
 *   Customer: import('./Customer').CustomerEntity
 * }} CustomerAccessTokenAssociatedEntity
 */
