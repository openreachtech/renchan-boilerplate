'use strict'

const {
  BaseRenderer,
} = require('@openreachtech/renchan').express

class MailgunSuccessRenderer extends BaseRenderer {
  /** @inheritdoc */
  get method () {
    return 'post'
  }

  /** @inheritdoc */
  get path () {
    return '/mailgun/success'
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
        message: 'I am version 1.0.0 of mailgun (^_^)',
      })
  }
}

module.exports = MailgunSuccessRenderer
