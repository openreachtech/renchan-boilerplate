import BaseSessionResult from './BaseSessionResult.js'

/**
 * The outcome of revoking a session. The payload stays domain-free as `response` on the base; this
 * subclass re-exposes it under a domain name, so call sites read the removal counts by what they
 * are.
 *
 * @augments {BaseSessionResult<SessionRevocationCounts>}
 */
export default class RevokingSessionResult extends BaseSessionResult {
  /**
   * get: the revocation counts — null when revoking failed.
   *
   * @returns {SessionRevocationCounts | null}
   */
  get revocation () {
    return this.response
  }
}

/**
 * How much a session revocation removed — the refresh tokens marked revoked, and the access token
 * rows deleted.
 *
 * @typedef {{
 *   revokedRefreshTokenCount: number
 *   deletedAccessTokenCount: number
 * }} SessionRevocationCounts
 */
