import {
  setTimeout,
} from 'timers/promises'

import {
  BaseMutationResolver,
} from '@openreachtech/renchan'

export default class UploadCustomerForumPostImageMutationResolver extends BaseMutationResolver {
  /** @override */
  static get schema () {
    return 'uploadCustomerForumPostImage'
  }

  /** @override */
  static get errorCodeHash () {
    return {
      ...super.errorCodeHash,
    }
  }

  /** @override */
  async resolve () {
    await setTimeout(300)

    return {
      imageUrl: 'http://openreach.tech/avatar-url/200.png',
    }
  }
}
