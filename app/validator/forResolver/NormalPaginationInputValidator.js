import {
  IntegerValueInspector,
} from '@openreachtech/mentsu-value-inspector'

import VALIDATION_LIMIT_CONSTANT_HASH from '../../constants/validationLimitConstants.js'

const {
  VALIDATION_LIMIT,
} = VALIDATION_LIMIT_CONSTANT_HASH

/**
 * Validator of the `pagination` of a list query's input, shared by every query validator.
 */
export default class NormalPaginationInputValidator {
  /**
   * Constructor.
   *
   * @param {NormalPaginationInputValidatorParams} params - Parameters.
   */
  constructor ({
    input,
    validColumns,
  }) {
    this.input = input
    this.validColumns = validColumns
  }

  /**
   * Factory method.
   *
   * @template {X extends typeof NormalPaginationInputValidator ? X : never} T, X
   * @param {NormalPaginationInputValidatorFactoryParams} params - Parameters for the factory method.
   * @returns {InstanceType<T>} Instance of this class.
   * @this {T}
   * @public
   */
  static create ({
    input,
    validColumns = [],
  }) {
    return /** @type {InstanceType<T>} */ (
      new this({
        input,
        validColumns,
      })
    )
  }

  /**
   * get: Inspector class for integer values.
   *
   * @returns {typeof IntegerValueInspector} The class.
   */
  static get IntegerValueInspectorCtor () {
    return IntegerValueInspector
  }

  /**
   * get: Directions a sort may be ordered in (the `SortDirection` enum).
   *
   * @returns {Array<string>} Sort directions.
   */
  static get SORT_DIRECTIONS () {
    return [
      'ASC',
      'DESC',
    ]
  }

  /**
   * get: Class itself.
   *
   * @returns {typeof NormalPaginationInputValidator} The class.
   */
  get Ctor () {
    return /** @type {typeof NormalPaginationInputValidator} */ (this.constructor)
  }

  /**
   * Extract the pagination of the input.
   *
   * @returns {PaginationInput | null} Pagination, or null when absent.
   */
  extractPagination () {
    return this.input
      ?.pagination
      ?? null
  }

  /**
   * Extract the page size, as it arrived.
   *
   * @returns {number | string | null} Limit, or null when absent.
   */
  extractLimit () {
    return this.extractPagination()
      ?.limit
      ?? null
  }

  /**
   * Extract the first row of the page, as it arrived.
   *
   * @returns {number | string | null} Offset, or null when absent.
   */
  extractOffset () {
    return this.extractPagination()
      ?.offset
      ?? null
  }

  /**
   * Extract the sort of the page.
   *
   * @returns {SortInput | null} Sort, or null when absent.
   */
  extractSort () {
    return this.extractPagination()
      ?.sort
      ?? null
  }

  /**
   * Validate the limit.
   *
   * @returns {boolean} True when the limit is an integer within the page size range.
   * @public
   */
  isValidLimit () {
    const inspector = this.createIntegerValueInspector({
      value: this.extractLimit(),
    })

    if (!inspector.isSafeIntegerLike()) {
      return false
    }

    const limit = inspector.normalizeValue()

    return limit >= VALIDATION_LIMIT.PAGINATION_LIMIT.MIN
      && limit <= VALIDATION_LIMIT.PAGINATION_LIMIT.MAX
  }

  /**
   * Create an IntegerValueInspector instance.
   *
   * @param {{
   *   value: number | string | null
   * }} params - Parameters.
   * @returns {IntegerValueInspector} Inspector of the value.
   */
  createIntegerValueInspector ({
    value,
  }) {
    return this.Ctor.IntegerValueInspectorCtor.create({
      value,
    })
  }

  /**
   * Validate the offset.
   *
   * @returns {boolean} True when the offset is an integer of its minimum or more.
   * @public
   */
  isValidOffset () {
    const offset = this.extractOffset()

    // The inspector reads an empty string as 0.
    if (offset === '') {
      return false
    }

    const inspector = this.createIntegerValueInspector({
      value: offset,
    })

    if (!inspector.isSafeIntegerLike()) {
      return false
    }

    return inspector.normalizeValue() >= VALIDATION_LIMIT.PAGINATION_OFFSET.MIN
  }

  /**
   * Validate the sort. An absent sort is valid.
   *
   * @returns {boolean} True when the sort is absent, or names a valid column and direction.
   * @public
   */
  isValidSort () {
    const sort = this.extractSort()

    if (!sort) {
      return true
    }

    return this.validColumns.includes(sort.targetColumn)
      && this.Ctor.SORT_DIRECTIONS.includes(sort.orderBy)
  }
}

/**
 * @typedef {{
 *   pagination?: PaginationInput | null
 * }} PaginatedInput
 */

/**
 * @typedef {{
 *   input: PaginatedInput
 *   validColumns: Array<string>
 * }} NormalPaginationInputValidatorParams
 */

/**
 * @typedef {{
 *   input: PaginatedInput
 *   validColumns?: Array<string>
 * }} NormalPaginationInputValidatorFactoryParams
 */

/**
 * @typedef {{
 *   targetColumn: string
 *   orderBy: string
 * }} SortInput
 */

/**
 * @typedef {{
 *   limit: number | string
 *   offset: number | string
 *   sort?: SortInput | null
 * }} PaginationInput
 */
