'use strict'

const {
  RenchanModel,
  ModelAttributeFactory,
} = require('@openreachtech/renchan-sequelize')

class AdminAccessToken extends RenchanModel {
  /** @inheritdoc */
  static createAttributes (DataTypes) {
    const factory = ModelAttributeFactory.create(DataTypes)

    return {
      ...factory.ID_BIGINT,

      // ForeignKey must start with upper case.
      AdminId: {
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

    this.belongsTo(this._.Admin)
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

module.exports = AdminAccessToken

/**
 * @typedef {AdminAccessToken & {
 *   AdminId: number;
 *   accessToken: string;
 *   generatedAt: Date;
 *   expiredAt: Date;
 * }} AdminAccessTokenEntity
 */

/**
 * @typedef {AdminAccessTokenEntity & {
 *   Admin: import('./Admin').AdminEntity
 * }} AdminAccessTokenWithAssociations
 */
