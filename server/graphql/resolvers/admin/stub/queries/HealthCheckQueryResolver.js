import {
  BaseQueryResolver,
} from '@openreachtech/renchan'

export default class HealthCheckQueryResolver extends BaseQueryResolver {
  /** @override */
  static get schema () {
    return 'healthCheck'
  }

  /** @override */
  static get errorCodeHash () {
    return {
      ...super.errorCodeHash,
    }
  }

  /** @override */
  async resolve () {
    return true
  }
}
