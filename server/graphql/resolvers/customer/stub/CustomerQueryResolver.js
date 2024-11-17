import {
  BaseQueryResolver,
} from '@openreachtech/renchan'

export default class CustomerQueryResolver extends BaseQueryResolver {
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

  /** @inheritdoc */
  get schema () {
    return 'customer'
  }
}
