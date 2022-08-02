// @ts-check
'use strict'

const {
  ReferralNode: RenchanReferralNode,
} = require('@openreachtech/renchan').models

/**
 * Referral node model.
 */
class ReferralNode extends RenchanReferralNode {
  /** @inheritdoc */
  static associate () {
    super.associate?.()

    // noop
  }

  /** @inheritdoc */
  static defineScopes (Op) {
    super.defineScopes?.(Op)

    // noop
  }
}

module.exports = ReferralNode
