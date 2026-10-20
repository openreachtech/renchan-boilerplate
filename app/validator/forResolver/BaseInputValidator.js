/**
 * Base class of the validators a resolver runs over its input.
 *
 * @template {Record<string, RenchanGraphqlErrorCtor>} E
 * @template I
 */
export default class BaseInputValidator {
  /**
   * Constructor.
   *
   * @param {{
   *   input: I
   *   errorHash: E
   * }} params - Parameters.
   */
  constructor ({
    input,
    errorHash,
  }) {
    this.input = input
    this.errorHash = errorHash
  }

  /**
   * Factory method.
   *
   * @template {X extends typeof BaseInputValidator ? X : never} T, X
   * @param {BaseInputValidatorFactoryParams} params - Parameters for the factory method.
   * @returns {InstanceType<T>} Instance of this class.
   * @this {T}
   * @public
   */
  static create ({
    input,
    errorHash,
  }) {
    return /** @type {InstanceType<T>} */ (
      new this({
        input,
        errorHash,
      })
    )
  }

  /**
   * Validate the input, and throw the error of the first rule it breaks.
   *
   * @returns {void}
   * @throws {RenchanGraphqlError} Error of the first entry whose predicate returns false.
   * @public
   */
  validate () {
    const error = this.validateInput()

    if (error) {
      throw error
    }
  }

  /**
   * Validate the input, and return the error of the first rule it breaks.
   *
   * @returns {RenchanGraphqlError | null} Error of the first failed entry, or null when none failed.
   * @public
   */
  validateInput () {
    const failedEntry = this.findFailedEntry()

    if (!failedEntry) {
      return null
    }

    const [, ErrorCtor] = failedEntry

    return ErrorCtor.create()
  }

  /**
   * Find the first entry whose predicate returns false.
   *
   * @returns {ValidationEntry | null} First failed entry, or null when none failed.
   */
  findFailedEntry () {
    return this.generateValidationEntries()
      .find(([isValid]) => !isValid())
      ?? null
  }

  /**
   * Generate the `[predicate, ErrorCtor]` entries, in the order they are checked.
   *
   * @abstract
   * @returns {Array<ValidationEntry>} Validation entries.
   * @throws {Error} When not inherited.
   */
  generateValidationEntries () {
    throw new Error(`${this.constructor.name}#generateValidationEntries() must be inherited`)
  }
}

/**
 * @typedef {import('@openreachtech/renchan').RenchanGraphqlError} RenchanGraphqlError
 */

/**
 * @typedef {typeof import('@openreachtech/renchan').RenchanGraphqlError} RenchanGraphqlErrorCtor
 */

/**
 * @typedef {[() => boolean, RenchanGraphqlErrorCtor]} ValidationEntry
 */

/**
 * @typedef {{
 *   input: *
 *   errorHash: Record<string, RenchanGraphqlErrorCtor>
 * }} BaseInputValidatorFactoryParams
 */
