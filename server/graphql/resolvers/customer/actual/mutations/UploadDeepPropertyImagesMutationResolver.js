import {
  setTimeout as sleep,
} from 'timers/promises'

import {
  BaseMutationResolver,
} from '@openreachtech/renchan'

/**
 * Upload deep property images mutation resolver.
 */
export default class UploadDeepPropertyImagesMutationResolver extends BaseMutationResolver {
  /** @override */
  static get schema () {
    return 'uploadDeepPropertyImages'
  }

  /** @override */
  static get errorCodeHash () {
    return {
      ...super.errorCodeHash,
    }
  }

  /**
   * Resolve.
   *
   * @param {{
   *   variables: {
   *     input: {
   *       profile: {
   *         nickname: string
   *         bio: string
   *         avatarImage: import('graphql-upload/Upload.mjs').default
   *       }
   *       config: {
   *         themeColor: string
   *         coverImage: import('graphql-upload/Upload.mjs').default
   *       }
   *     }
   *   }
   * }} params - Parameters.
   * @returns {Promise<{
   *   avatarImage: {
   *     filename: string
   *     mimetype: string
   *     encoding: string
   *   }
   *   coverImage: {
   *     filename: string
   *     mimetype: string
   *     encoding: string
   *   }
   * }>} - Response.
   */
  async resolve ({
    variables: {
      input: {
        profile: {
          nickname,
          bio,
          avatarImage,
        },
        config: {
          themeColor,
          coverImage,
        },
      },
    },
  }) {
    await sleep(300)

    const avatarImageReader = await this.Ctor
      // @ts-expect-error
      .createAsyncFileContentReader({
        upload: avatarImage,
      })
    const coverImageReader = await this.Ctor
      // @ts-expect-error
      .createAsyncFileContentReader({
        upload: coverImage,
      })

    return this.formatResponse({
      avatarImageReader,
      coverImageReader,
    })
  }

  /**
   * Format response.
   *
   * @param {{
   *   avatarImageReader: import('@openreachtech/renchan/lib/tools/FileContentReader').default
   *   coverImageReader: import('@openreachtech/renchan/lib/tools/FileContentReader').default
   * }} params - Parameters.
   * @returns {{
   *   avatarImage: {
   *     filename: string
   *     mimetype: string
   *     encoding: string
   *   }
   *   coverImage: {
   *     filename: string
   *     mimetype: string
   *     encoding: string
   *   }
   * }} - Response.
   */
  formatResponse ({
    avatarImageReader,
    coverImageReader,
  }) {
    return {
      avatarImage: {
        filename: avatarImageReader.filename,
        mimetype: avatarImageReader.mimetype,
        encoding: avatarImageReader.encoding,
      },
      coverImage: {
        filename: coverImageReader.filename,
        mimetype: coverImageReader.mimetype,
        encoding: coverImageReader.encoding,
      },
    }
  }
}
