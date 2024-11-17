import {
  BaseQueryResolver,
} from '@openreachtech/renchan'

export default class CustomerQueryResolver extends BaseQueryResolver {
  /** @override */
  static get schema () {
    return 'customer'
  }

  /**
   * Resolve the customer query
   *
   * @param {*} params - Parameters.
   * @returns {Promise<object>}
   */
  async resolve ({
    context,
  }) {
    return {
      id: 10001,
      username: 'Jiro',
      inviteCode: 'invite-code-alpha',
      CustomerDetail: {
        email: 'jiro@example.com',
      },
    }
  }
}
