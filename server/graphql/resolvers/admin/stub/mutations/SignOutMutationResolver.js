import {
  BaseMutationResolver,
} from '@openreachtech/renchan'

export default class SignOutMutationResolver extends BaseMutationResolver {
  /** @override */
  static get schema () {
    return 'signOut'
  }

  /** @override */
  static get errorCodeHash () {
    return {
      ...super.errorCodeHash,
    }
  }

  /** @override */
  async resolve () {
    return {
      isSignedOut: true,
    }
  }
}
