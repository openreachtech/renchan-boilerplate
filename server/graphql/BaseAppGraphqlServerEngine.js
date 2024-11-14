import express from 'express'
import cors from 'cors'

import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs'

import {
  BaseGraphqlServerEngine,
} from '@openreachtech/renchan'

/**
 * Renchan server engine for admin.
 */
export default class BaseAppGraphqlServerEngine extends BaseGraphqlServerEngine {
  /** @override */
  collectMiddleware () {
    return [
      cors({
        origin: '*',
      }),

      express.json({
        // @ts-expect-error
        extended: true,
        limit: '10mb',
      }),

      express.static(
        this.config.staticPath
      ),

      graphqlUploadExpress({
        maxFileSize: 10000000, // 10 MB
        maxFiles: 10,
      }),

      express.urlencoded({
        extended: true,
        verify: (req, res, body) => {
          // eslint-disable-next-line no-param-reassign
          req['rawBody'] = body.toString()
        },
      }),
    ]
  }
}
