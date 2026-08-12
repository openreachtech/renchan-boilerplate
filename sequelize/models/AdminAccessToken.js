import {
  RenchanModel,
  ModelAttributeFactory,
} from '@openreachtech/renchan-sequelize'

/**
 * AdminAccessToken model.
 */
export default class AdminAccessToken extends RenchanModel {
  /** @override */
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
      sessionKey: {
        type: DataTypes.STRING(191),
        // TODO: tighten to allowNull: false once every access-token writer sets sessionKey (later PR).
        allowNull: true,
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

  /** @override */
  static createOptions (sequelizeClient) {
    return {
      ...super.createOptions(sequelizeClient),
    }
  }

  /** @override */
  static associate () {
    super.associate?.()

    this.belongsTo(this._.Admin)
  }

  /** @override */
  static defineScopes (Op) {
    super.defineScopes?.(Op)

    // noop
  }

  /** @override */
  static setupHooks () {
    super.setupHooks?.()

    // noop
  }

  /** @override */
  static defineSubqueries () {
    super.defineSubqueries?.()

    // noop
  }
}

/**
 * @typedef {AdminAccessToken & {
 *   AdminId: number
 *   accessToken: string
 *   generatedAt: Date
 *   expiredAt: Date
 * }} AdminAccessTokenEntity
 */

/**
 * @typedef {AdminAccessTokenEntity & {
 *   Admin: import('./Admin').AdminEntity
 * }} AdminAccessTokenAssociatedEntity
 */
