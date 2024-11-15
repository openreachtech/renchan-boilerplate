import {
  BaseMutationResolver,
} from '@openreachtech/renchan'

export default class SignUpMutationResolver extends BaseMutationResolver {
  /** @override */
  static get schema () {
    return 'signUp'
  }

  /** @override */
  async resolve () {
    return {
      accessToken: 'stub-access-token-0002',
      admin: {
        id: 50002,
        name: 'Stub admin',
      },
    }
  }
}
