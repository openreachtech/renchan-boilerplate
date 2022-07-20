// @ts-check
'use strict'

const {
  Customer: RenchanCustomer,
} = require('@openreachtech/renchan').models

/**
 * Customer model.
 */
class Customer extends RenchanCustomer {
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

module.exports = Customer
