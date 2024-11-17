import {
  Sequelize,
} from 'sequelize'

import {
  ModelAttributeFactory,
  RenchanModel,
} from '@openreachtech/renchan-sequelize'

import FertileForest from '@steweucen/fertile-forest-sequelize'

const SequelizeWithFFModel = new Proxy(Sequelize, {
  get (
    Sequelize,
    property,
    receiver
  ) {
    if (property === 'Model') {
      return RenchanModel
    }

    return Reflect.get(Sequelize, property, receiver)
  },
})

FertileForest.init(SequelizeWithFFModel)

/**
 * Customer Referral node model.
 */
export default class CustomerReferralNode extends FertileForest.Model {
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
 * @typedef {CustomerReferralNode & {
 *   id: number
 *   CustomerId: number
 *   ffQueue: number
 *   ffDepth: number
 * }} CustomerReferralNodeEntity
 */
