import {
  setTimeout,
} from 'timers/promises'

import {
  BaseMutationResolver,
} from '@openreachtech/renchan'

export default class SignUpMutationResolver extends BaseMutationResolver {
  /** @override */
  static get schema () {
    return 'signUp'
  }

  /** @override */
  async resolve ({
    variables: {
      input: {
        email = 'extra@example.com',
        username = 'extra',
        firstName = 'John',
        lastName = 'Doe',
        password = 'p@ssw0rd',
      } = {},
    },
  }) {
    await setTimeout(500)

    return {
      sentTo: email,
    }
  }
}
