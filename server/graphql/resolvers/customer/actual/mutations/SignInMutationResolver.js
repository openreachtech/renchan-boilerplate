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
      accessToken: 'actual-access-token-0001',
      customer: {
        id: 50001,
        name: 'Actual John Doe',
        inviteCode: 'actual0123',
      },
    }
  }
}
