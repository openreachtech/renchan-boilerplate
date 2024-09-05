'use strict'

const {
  v4: generateUuid,
} = require('uuid')

const {
  graphql: {
    BaseContext,
  },
} = require('@openreachtech/renchan')

class BaseAppContext extends BaseContext {
  /**
   * Constructor.
   *
   * @param {BaseAppContextParams} params - Parameters of this class.
   */
  constructor ({
    uuid,
    ...extraParams
  }) {
    super(extraParams)

    this.uuid = uuid
  }

  /**
   * Factory method.
   *
   * @override
   * @param {BaseAppContextFactoryParams} params - Parameters of factory method.
   * @returns {BaseAppContext} - Instance of this class.
   */
  static create ({
    uuid = this.issueUuid(),
    ...extraParams
  }) {
    return new this({
      uuid,
      ...extraParams,
    })
  }

  /**
   * Issue UUID.
   *
   * @returns {string} - UUID string.
   */
  static issueUuid () {
    return generateUuid()
  }
}

module.exports = BaseAppContext

/**
 * @typedef {{
 *   uuid: string
 *   request: import('express').Request
 * }} BaseAppContextParams
 */

/**
 * @typedef {{
 *   uuid?: string
 *   request: import('express').Request
 * }} BaseAppContextFactoryParams
 */
