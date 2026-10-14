import {
  BaseRestfulApiShare,
} from '@openreachtech/renchan'

import AllowedCorsOriginCollection from '../../tools/AllowedCorsOriginCollection.js'

export default class AppRestfulApiShare extends BaseRestfulApiShare {
  /**
   * Generate the origins a browser may call the engine from.
   *
   * @returns {Array<string>} - Allowed origins, none when `CORS_RESTFUL_API_ORIGINS` declares none.
   */
  generateAllowedOrigins () {
    return AllowedCorsOriginCollection.create({
      originsString: this.env.CORS_RESTFUL_API_ORIGINS,
    })
      .extractOrigins()
  }
}
