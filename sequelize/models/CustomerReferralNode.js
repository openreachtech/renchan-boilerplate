'use strict'

const {
  ReferralNode: RenchanReferralNode,
} = require('@openreachtech/renchan').models

const {
  ModelAttributeFactory,
} = require('@openreachtech/renchan-sequelize')

/**
 * Customer Referral node model.
 */
class CustomerReferralNode extends RenchanReferralNode {
  /** @inheritdoc */
  static createAttributes (DataTypes) {
    const factory = ModelAttributeFactory.create(DataTypes)

    return {
      ...factory.ID_BIGINT,

      // Foreign keys must start with upper case
      CustomerId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      ffQueue: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      ffDepth: {
        type: DataTypes.BIGINT,
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

module.exports = CustomerReferralNode
