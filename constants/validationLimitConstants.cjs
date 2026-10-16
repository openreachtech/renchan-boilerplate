'use strict'

/*
 * Limits the resolver input validators hold values to.
 */
module.exports = {
  VALIDATION_LIMIT: {
    PAGINATION_LIMIT: {
      MIN: 1,
      MAX: 100,
    },
    PAGINATION_OFFSET: {
      MIN: 0,
    },
  },
}
