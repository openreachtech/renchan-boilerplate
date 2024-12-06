import {
  BasePostRenderer,
  RestfulApiResponse,
} from '@openreachtech/renchan'

/**
 * Mailgun success renderer.
 *
 * @extends {BasePostRenderer<MailgunSuccessRendererInputBody,  MailgunSuccessRendererInputQuery>}
 */
export default class MailgunSuccessRenderer extends BasePostRenderer {
  /** @override */
  get routePath () {
    return '/mailgun/success'
  }

  /** @override */
  static get errorStructureHash () {
    return {
      AlphaRequired: {
        statusCode: 400,
        errorMessage: 'first is required',
      },
    }
  }

  /**
   * Passes filter.
   *
   * @override
   * @returns {boolean} - false: filter for visa
   */
  get passesFilter () {
    return true
  }

  /**
   * Render Coinpayments success.
   *
   * @override
   * @param {RestfulApiType.RenderInput<*, *>} input - Input data.
   * @returns {Promise<RestfulApiType.RenderResponse>} - Success response.
   */
  async render ({
    query: {
      first,
      second,
    },
    context, // has now, share.env
    request, // has req, res, next
  }) {
    const content = {
      status: 'success',
      message: 'I am version 1.0.0 of mailgun (^_^)',
      receivedValues: [
        first,
        second,
      ],
    }

    return RestfulApiResponse.create({
      content,
    })
  }
}

/**
 * @typedef {{
 *   one: string
 *   two: string
 * }} MailgunSuccessRendererInputBody
 */

/**
 * @typedef {{
 *   alpha: string
 *   beta: string
 * }} MailgunSuccessRendererInputQuery
 */

/**
 * @typedef {{
 *   status: string
 *   message: string
 *   receivedValues: Array<*>
 * }} MailgunSuccessRendererResponse
 */
