import {
  BaseMutationResolver,
} from '@openreachtech/renchan'

export default class SignInMutationResolver extends BaseMutationResolver {
  /** @override */
  static get schema () {
    return 'signIn'
  }

  /** @override */
  async resolve () {
    return {
      accessToken: 'stub-access-token-0001',
      customer: {
        id: 50001,
        name: 'Stub John Doe',
        inviteCode: 'stub0123',
      },
    }
  }
}
