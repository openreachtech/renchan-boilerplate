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
   * get: Pagination of the input.
   *
   * @returns {PaginationInput | null} Pagination, or null when absent.
   */
  get pagination () {
    return this.input
      ?.pagination
      ?? null
  }

  /**
   * get: Page size, as it arrived.
   *
   * @returns {number | string | null} Limit, or null when absent.
   */
  get limit () {
    return this.pagination
      ?.limit
      ?? null
  }

  /**
   * get: First row of the page, as it arrived.
   *
   * @returns {number | string | null} Offset, or null when absent.
   */
  get offset () {
    return this.pagination
      ?.offset
      ?? null
  }

  /**
   * get: Sort of the page.
   *
   * @returns {SortInput | null} Sort, or null when absent.
   */
  get sort () {
    return this.pagination
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
      value: this.limit,
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
    // The inspector reads an empty string as 0.
    if (this.offset === '') {
      return false
    }

    const inspector = this.createIntegerValueInspector({
      value: this.offset,
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
    if (!this.sort) {
      return true
    }

    return this.validColumns.includes(this.sort.targetColumn)
      && this.Ctor.SORT_DIRECTIONS.includes(this.sort.orderBy)
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
