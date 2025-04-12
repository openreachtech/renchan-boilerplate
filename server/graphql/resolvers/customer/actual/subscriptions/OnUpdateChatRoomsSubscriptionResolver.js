import {
  BaseSubscriptionResolver,
} from '@openreachtech/renchan'

/**
 * OnUpdateChatRooms subscription graphql resolver.
 *
 * @extends {BaseSubscriptionResolver<OnUpdateChatRoomsSubscribeVariables, OnUpdateChatRoomsSubscribeResponse>}
 */
export default class OnUpdateChatRoomsSubscriptionResolver extends BaseSubscriptionResolver {
  /** @override */
  static get schema () {
    return 'onUpdateChatRooms'
  }

  /** @override */
  static get errorCodeHash () {
    return {
      ...super.errorCodeHash,
    }
  }

  /** @override */
  generateChannelQuery ({
    context,
  }) {
    return {}
  }
}

/**
 * @typedef {{}} OnUpdateChatRoomsSubscribeVariables
 */

/**
 * @typedef {{
 *   onUpdateChatRooms: {
 *     rooms: Array<{
 *       id: number
 *       name: string
 *     }>
 *   }
 * }} OnUpdateChatRoomsSubscribeResponse
 */
