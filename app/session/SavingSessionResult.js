import BaseSessionResult from './BaseSessionResult.js'

/**
 * The outcome of saving or rotating a session. The payload stays domain-free as `response` on the
 * base; this subclass re-exposes it under a domain name, so call sites read the saved credential
 * pair by what it is.
 *
 * @augments {BaseSessionResult<SessionCredentialPair>}
 */
export default class SavingSessionResult extends BaseSessionResult {
  /**
   * get: the saved credential pair — null when saving failed.
   *
   * @returns {SessionCredentialPair | null}
   */
  get credentialPair () {
    return this.response
  }
}

/**
 * @typedef {import('./SessionClerk.js').SessionCredentialPair} SessionCredentialPair
 */
