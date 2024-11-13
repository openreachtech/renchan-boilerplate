import {
  BaseQueryResolver,
} from '@openreachtech/renchan'

export default class CustomerQueryResolver extends BaseQueryResolver {
  /**
   * Resolve the admins query
   *
   * @param {{}} params - Parameters.
   * @returns {Promise<object>}
   */
  async resolve ({}) {
    return {
      id: 10001,
      username: 'Jiro',
      inviteCode: 'invite-code-alpha',
      CustomerDetail: {
        email: 'jiro@example.com',
      },
    }
  }

  /** @inheritdoc */
  get schema () {
    return 'customer'
  }
}
