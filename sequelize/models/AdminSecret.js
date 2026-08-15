import {
  BackupMixinModel,
  RenchanModel,
  ModelAttributeFactory,
} from '@openreachtech/renchan-sequelize'

/**
 * AdminSecret model.
 */
export default class AdminSecret extends RenchanModel {
  /** @override */
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

  /** @override */
  static get Mixins () {
    return [
      BackupMixinModel,
    ]
  }

  /**
   * get: Backup model for BackupMixinModel
   *
   * @returns {typeof import('./AdminSecretsBk')} - Backup model declaration
   */
  static get BackupModel () {
    return this._.AdminSecretsBk
  }

  /**
   * get: Admin password hash entity, reached through the Admin association.
   *
   * Encapsulates the `Admin → AdminPasswordHash` chain so a caller need not know it. Returns null
   * when the association was not eager-loaded (queried without the `include`).
   *
   * @returns {import('./AdminPasswordHash.js').AdminPasswordHashEntity | null} - Password hash, or null.
   */
  get passwordHashEntity () {
    return this.Admin
      ?.AdminPasswordHash
      ?? null
  }
}

/**
 * @typedef {AdminSecret & {
 *   id: number
 *   AdminId: number
 *   email: string
 *   savedAt: Date
 * }} AdminSecretEntity
 */
