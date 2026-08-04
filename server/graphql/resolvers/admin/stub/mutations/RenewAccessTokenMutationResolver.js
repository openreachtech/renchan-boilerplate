import {
  BaseMutationResolver,
} from '@openreachtech/renchan'

/**
 * Stub resolver: renewAccessToken mutation.
 *
 * @extends {BaseMutationResolver}
 */
export default class RenewAccessTokenMutationResolver extends BaseMutationResolver {
  /**
   * get: Operation name.
   *
   * @override
   * @returns {string} - Operation name.
   */
  static get schema () {
    return 'renewAccessToken'
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
   * @returns {Promise<graphql.RenewAccessTokenResult>} - Result of the mutation.
   */
  async resolve () {
    return {
      accessToken: 'stubRenewedAccessToken000000000000000000000000000000000000000001',
    }
  }
}
