import {
  BaseMutationResolver,
} from '@openreachtech/renchan'

/**
 * Stub resolver: signOut mutation.
 *
 * @extends {BaseMutationResolver}
 */
export default class SignOutMutationResolver extends BaseMutationResolver {
  /**
   * get: Operation name.
   *
   * @override
   * @returns {string} - Operation name.
   */
  static get schema () {
    return 'signOut'
  }

  /**
   * get: Error code hash. Kept empty in a stub.
   *
   * @override
   * @returns {Record<string, string>} - Error code hash.
   */
  static get errorCodeHash () {
    return {
      ...super.errorCodeHash,
    }
  }

  /**
   * Resolve. Returns hardcoded, schema-accurate data.
   *
   * @override
   * @returns {Promise<graphql.SignOutResult>} - Result of the mutation.
   */
  async resolve () {
    return {
      signedOut: true,
    }
  }
}
