import {
  BaseGetRenderer,
  RestfulApiResponse,
} from '@openreachtech/renchan'

/**
 * Coinpayments success renderer.
 *
 * @extends {BaseGetRenderer<CoinpaymentsSuccessRendererInputQuery, CoinpaymentsSuccessRendererResponse>}
 */
export default class CoinpaymentsSuccessRenderer extends BaseGetRenderer {
  /** @override */
  get routePath () {
    return '/coinpayments/success'
  }

  /** @override */
  static get errorStructureHash () {
    return {
      AlphaRequired: {
        statusCode: 400,
        errorMessage: 'alpha is required',
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
   * @returns {Promise<RestfulApiResponse>} - Success response.
   */
  async render ({
    query: {
      alpha,
      beta,
    },
    context, // has now, share.env
    request, // has req, res, next
  }) {
    if (!alpha) {
      return this.Error.AlphaRequired.createAsError()
    }

    const content = {
      status: 'success',
      message: 'I am version 1.0.0 of Coinpayments (^_^)',
      receivedValues: [
        {
          alpha,
          beta,
        },
        context.now.toISOString(),
      ],
    }

    return RestfulApiResponse.create({
      statusCode: 200,
      content,
    })
  }
}

/**
 * @typedef {{
 *   alpha: string
 *   beta: string
 * }} CoinpaymentsSuccessRendererInputQuery
 */

/**
 * @typedef {{
 *   status: string
 *   message: string
 *   receivedValues: Array<*>
 * }} CoinpaymentsSuccessRendererResponse
 */
