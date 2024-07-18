// @ts-check
'use strict'

const {
  RenchanModel,
  ModelAttributeFactory,
} = require('@openreachtech/renchan-sequelize')

/**
 * Customer model.
 */
class Customer extends RenchanModel {
  /** @inheritdoc */
  static createAttributes (DataTypes) {
    const factory = ModelAttributeFactory.create(DataTypes)

    return {
      ...factory.ID_BIGINT,

      registeredAt: {
        type: DataTypes.DATE(3),
        allowNull: false,
      },
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
}

module.exports = Customer
