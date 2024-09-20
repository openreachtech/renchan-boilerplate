'use strict'

const {
  BaseRenderer,
} = require('@openreachtech/renchan').express

class CoinpaymentsSuccessRenderer extends BaseRenderer {
  /** @inheritdoc */
  get method () {
    return 'get'
  }

  /** @inheritdoc */
  get path () {
    return '/coinpayments/success'
  }

  /** @inheritdoc */
  async render (
    req,
    res,
    next
  ) {
    res.status(200)
      .json({
        status: 'success',
        message: 'I am version 1.0.0 of Coinpayments (^_^)',
      })
  }
}

module.exports = CoinpaymentsSuccessRenderer
