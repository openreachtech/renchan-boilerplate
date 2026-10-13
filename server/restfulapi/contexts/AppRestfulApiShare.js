import {
  BaseRestfulApiShare,
} from '@openreachtech/renchan'

import AllowedOriginsParser from '../../tools/AllowedOriginsParser.js'

export default class AppRestfulApiShare extends BaseRestfulApiShare {
  /**
   * Generate the origins a browser may call the engine from.
   *
   * @returns {Array<string>} - Allowed origins, none when `CORS_RESTFUL_API_ORIGINS` declares none.
   */
  generateAllowedOrigins () {
    return AllowedOriginsParser.create({
      originsText: this.env.CORS_RESTFUL_API_ORIGINS,
    })
      .parseOrigins()
  }
}
