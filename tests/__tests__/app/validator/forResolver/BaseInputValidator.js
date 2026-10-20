import BaseInputValidator from '../../../../../app/validator/forResolver/BaseInputValidator.js'

import {
  RenchanGraphqlError,
} from '@openreachtech/renchan'

/**
 * @extends {BaseInputValidator<*, { validationEntries: Array<ValidationEntry> }>}
 */
class EntryListInputValidator extends BaseInputValidator {
  /** @override */
  generateValidationEntries () {
    return this.input.validationEntries
  }
}

describe('BaseInputValidator', () => {
  describe('constructor', () => {
    describe('should keep property', () => {
      describe('#input', () => {
        const cases = [
          {
            tally: {
              alpha: 'alpha-0001',
            },
          },
          {
            tally: {
              beta: 100002,
            },
          },
        ]

        test.each(cases)('input: $tally', ({ tally }) => {
          const args = {
            input: tally,
            errorHash: {}, // neutral value; not under test
          }

          const received = new BaseInputValidator(args)

          expect(received)
            .toHaveProperty('input', tally)
        })
      })

      describe('#errorHash', () => {
        /**
         * @type {Array<{
         *   tally: Record<string, typeof import('@openreachtech/renchan').RenchanGraphqlError>
         * }>}
         */
        const cases = [
          {
            tally: {
              InvalidAlpha: RenchanGraphqlError.declareGraphqlError({
                code: '203.T001.001',
              }),
            },
          },
          {
            tally: {},
          },
        ]

        test.each(cases)('errorHash: $tally', ({ tally }) => {
          const args = {
            input: {}, // neutral value; not under test
            errorHash: tally,
          }

          const received = new BaseInputValidator(args)

          expect(received)
            .toHaveProperty('errorHash', tally)
        })
      })
    })
  })
})

describe('BaseInputValidator', () => {
  describe('.create()', () => {
    describe('should be an instance of own class', () => {
      /**
       * @type {Array<{
       *   input: {
       *     input: Record<string, *>
       *     errorHash: Record<string, typeof import('@openreachtech/renchan').RenchanGraphqlError>
       *   }
       * }>}
       */
      const cases = [
        {
          input: {
            input: {
              alpha: 'alpha-0001',
            },
            errorHash: {},
          },
        },
        {
          input: {
            input: {
              beta: 100002,
            },
            errorHash: {
              InvalidBeta: RenchanGraphqlError.declareGraphqlError({
                code: '203.T001.002',
              }),
            },
          },
        },
      ]

      test.each(cases)('input: $input.input', ({ input }) => {
        const received = BaseInputValidator.create(input)

        expect(received)
          .toBeInstanceOf(BaseInputValidator)
      })
    })

    describe('should call constructor', () => {
      /**
       * @type {Array<{
       *   tally: {
       *     input: Record<string, *>
       *     errorHash: Record<string, typeof import('@openreachtech/renchan').RenchanGraphqlError>
       *   }
       * }>}
       */
      const cases = [
        {
          tally: {
            input: {
              alpha: 'alpha-0001',
            },
            errorHash: {},
          },
        },
        {
          tally: {
            input: {
              beta: 100002,
            },
            errorHash: {
              InvalidBeta: RenchanGraphqlError.declareGraphqlError({
                code: '203.T001.002',
              }),
            },
          },
        },
      ]

      test.each(cases)('input: $tally.input', ({ tally }) => {
        const SpyClass = globalThis.constructorSpy.spyOn(BaseInputValidator)

        SpyClass.create(tally)

        expect(SpyClass.__spy__)
          .toHaveBeenCalledWith(tally)
      })
    })
  })
})

describe('BaseInputValidator', () => {
  describe('#validate()', () => {
    const errorHash = {
      InvalidAlpha: RenchanGraphqlError.declareGraphqlError({
        code: '203.T001.001',
      }),
      InvalidBeta: RenchanGraphqlError.declareGraphqlError({
        code: '203.T001.002',
      }),
      InvalidGamma: RenchanGraphqlError.declareGraphqlError({
        code: '203.T001.003',
      }),
    }

    describe('when every predicate returns true', () => {
      /**
       * @type {Array<{
       *   override: {
       *     validationEntries: Array<import('../../../../../app/validator/forResolver/BaseInputValidator.js').ValidationEntry>
       *   }
       * }>}
       */
      const cases = [
        {
          override: {
            validationEntries: [
              [() => true, errorHash.InvalidAlpha],
              [() => true, errorHash.InvalidBeta],
              [() => true, errorHash.InvalidGamma],
            ],
          },
        },
        {
          override: {
            validationEntries: [
              [() => true, errorHash.InvalidAlpha],
            ],
          },
        },
        {
          override: {
            validationEntries: [],
          },
        },
      ]

      test.each(cases)('entries: $override.validationEntries.length', ({ override }) => {
        const validator = EntryListInputValidator.create({
          input: {
            validationEntries: override.validationEntries,
          },
          errorHash,
        })

        const received = validator.validate()

        expect(received)
          .toBeUndefined()
      })
    })

    describe('when a predicate returns false', () => {
      /**
       * @type {Array<{
       *   override: {
       *     validationEntries: Array<import('../../../../../app/validator/forResolver/BaseInputValidator.js').ValidationEntry>
       *   }
       *   expected: string
       * }>}
       */
      const cases = [
        {
          override: {
            validationEntries: [
              [() => false, errorHash.InvalidAlpha],
              [() => false, errorHash.InvalidBeta],
              [() => false, errorHash.InvalidGamma],
            ],
          },
          expected: '203.T001.001',
        },
        {
          override: {
            validationEntries: [
              [() => true, errorHash.InvalidAlpha],
              [() => false, errorHash.InvalidBeta],
              [() => false, errorHash.InvalidGamma],
            ],
          },
          expected: '203.T001.002',
        },
        {
          override: {
            validationEntries: [
              [() => true, errorHash.InvalidAlpha],
              [() => true, errorHash.InvalidBeta],
              [() => false, errorHash.InvalidGamma],
            ],
          },
          expected: '203.T001.003',
        },
      ]

      test.each(cases)('should throw error of the first failed entry: $expected', ({ override, expected }) => {
        const validator = EntryListInputValidator.create({
          input: {
            validationEntries: override.validationEntries,
          },
          errorHash,
        })

        expect(() => validator.validate())
          .toThrow(expected)
      })
    })
  })
})

describe('BaseInputValidator', () => {
  describe('#validateInput()', () => {
    const errorHash = {
      InvalidAlpha: RenchanGraphqlError.declareGraphqlError({
        code: '203.T001.001',
      }),
      InvalidBeta: RenchanGraphqlError.declareGraphqlError({
        code: '203.T001.002',
      }),
      InvalidGamma: RenchanGraphqlError.declareGraphqlError({
        code: '203.T001.003',
      }),
    }

    describe('when every predicate returns true', () => {
      /**
       * @type {Array<{
       *   override: {
       *     validationEntries: Array<import('../../../../../app/validator/forResolver/BaseInputValidator.js').ValidationEntry>
       *   }
       * }>}
       */
      const cases = [
        {
          override: {
            validationEntries: [
              [() => true, errorHash.InvalidAlpha],
              [() => true, errorHash.InvalidBeta],
            ],
          },
        },
        {
          override: {
            validationEntries: [],
          },
        },
      ]

      test.each(cases)('entries: $override.validationEntries.length', ({ override }) => {
        const validator = EntryListInputValidator.create({
          input: {
            validationEntries: override.validationEntries,
          },
          errorHash,
        })

        const received = validator.validateInput()

        expect(received)
          .toBeNull()
      })
    })

    describe('when a predicate returns false', () => {
      /**
       * @type {Array<{
       *   override: {
       *     validationEntries: Array<import('../../../../../app/validator/forResolver/BaseInputValidator.js').ValidationEntry>
       *   }
       *   expected: {
       *     ErrorCtor: typeof import('@openreachtech/renchan').RenchanGraphqlError
       *     message: string
       *   }
       * }>}
       */
      const cases = [
        {
          override: {
            validationEntries: [
              [() => false, errorHash.InvalidAlpha],
              [() => false, errorHash.InvalidBeta],
              [() => false, errorHash.InvalidGamma],
            ],
          },
          expected: {
            ErrorCtor: errorHash.InvalidAlpha,
            message: '203.T001.001',
          },
        },
        {
          override: {
            validationEntries: [
              [() => true, errorHash.InvalidAlpha],
              [() => false, errorHash.InvalidBeta],
              [() => false, errorHash.InvalidGamma],
            ],
          },
          expected: {
            ErrorCtor: errorHash.InvalidBeta,
            message: '203.T001.002',
          },
        },
        {
          override: {
            validationEntries: [
              [() => true, errorHash.InvalidAlpha],
              [() => true, errorHash.InvalidBeta],
              [() => false, errorHash.InvalidGamma],
            ],
          },
          expected: {
            ErrorCtor: errorHash.InvalidGamma,
            message: '203.T001.003',
          },
        },
      ]

      describe('should return error of the first failed entry', () => {
        test.each(cases)('message: $expected.message', ({ override, expected }) => {
          const validator = EntryListInputValidator.create({
            input: {
              validationEntries: override.validationEntries,
            },
            errorHash,
          })

          const received = validator.validateInput()

          expect(received)
            .toBeInstanceOf(expected.ErrorCtor)
        })
      })

      describe('should carry the error code as message', () => {
        test.each(cases)('message: $expected.message', ({ override, expected }) => {
          const validator = EntryListInputValidator.create({
            input: {
              validationEntries: override.validationEntries,
            },
            errorHash,
          })

          const error = /** @type {import('@openreachtech/renchan').RenchanGraphqlError} */ (validator.validateInput())
          const received = error.message

          expect(received)
            .toBe(expected.message)
        })
      })
    })
  })
})

describe('BaseInputValidator', () => {
  describe('#findFailedEntry()', () => {
    const errorHash = {
      InvalidAlpha: RenchanGraphqlError.declareGraphqlError({
        code: '203.T001.001',
      }),
      InvalidBeta: RenchanGraphqlError.declareGraphqlError({
        code: '203.T001.002',
      }),
    }

    /** @type {import('../../../../../app/validator/forResolver/BaseInputValidator.js').ValidationEntry} */
    const alphaPassedEntry = [() => true, errorHash.InvalidAlpha]

    /** @type {import('../../../../../app/validator/forResolver/BaseInputValidator.js').ValidationEntry} */
    const alphaFailedEntry = [() => false, errorHash.InvalidAlpha]

    /** @type {import('../../../../../app/validator/forResolver/BaseInputValidator.js').ValidationEntry} */
    const betaPassedEntry = [() => true, errorHash.InvalidBeta]

    /** @type {import('../../../../../app/validator/forResolver/BaseInputValidator.js').ValidationEntry} */
    const betaFailedEntry = [() => false, errorHash.InvalidBeta]

    describe('when a predicate returns false', () => {
      const cases = [
        {
          override: {
            validationEntries: [
              alphaFailedEntry,
              betaFailedEntry,
            ],
          },
          expected: alphaFailedEntry,
        },
        {
          override: {
            validationEntries: [
              alphaPassedEntry,
              betaFailedEntry,
            ],
          },
          expected: betaFailedEntry,
        },
      ]

      test.each(cases)('should return the first failed entry: $#', ({ override, expected }) => {
        const validator = EntryListInputValidator.create({
          input: {
            validationEntries: override.validationEntries,
          },
          errorHash,
        })

        const received = validator.findFailedEntry()

        expect(received)
          .toBe(expected) // same reference
      })
    })

    describe('when every predicate returns true', () => {
      const cases = [
        {
          override: {
            validationEntries: [
              alphaPassedEntry,
              betaPassedEntry,
            ],
          },
        },
        {
          override: {
            validationEntries: [],
          },
        },
      ]

      test.each(cases)('should return null: $override.validationEntries.length', ({ override }) => {
        const validator = EntryListInputValidator.create({
          input: {
            validationEntries: override.validationEntries,
          },
          errorHash,
        })

        const received = validator.findFailedEntry()

        expect(received)
          .toBeNull()
      })
    })

    describe('when the first entry fails', () => {
      test('should not call the predicates after it', () => {
        const predicateHash = {
          isValidAlpha: () => false,
          isValidBeta: () => true,
        }
        const isValidBetaSpy = jest.spyOn(predicateHash, 'isValidBeta')

        const validator = EntryListInputValidator.create({
          input: {
            validationEntries: [
              [() => predicateHash.isValidAlpha(), errorHash.InvalidAlpha],
              [() => predicateHash.isValidBeta(), errorHash.InvalidBeta],
            ],
          },
          errorHash,
        })

        validator.findFailedEntry()

        expect(isValidBetaSpy)
          .not
          .toHaveBeenCalled()
      })
    })
  })
})

describe('BaseInputValidator', () => {
  describe('#generateValidationEntries()', () => {
    describe('when not inherited', () => {
      /** @extends {BaseInputValidator<*, *>} */
      class AlphaInputValidator extends BaseInputValidator {}

      /** @extends {BaseInputValidator<*, *>} */
      class BetaInputValidator extends BaseInputValidator {}

      const cases = [
        {
          input: {
            Validator: BaseInputValidator,
          },
          expected: 'BaseInputValidator#generateValidationEntries() must be inherited',
        },
        {
          input: {
            Validator: AlphaInputValidator,
          },
          expected: 'AlphaInputValidator#generateValidationEntries() must be inherited',
        },
        {
          input: {
            Validator: BetaInputValidator,
          },
          expected: 'BetaInputValidator#generateValidationEntries() must be inherited',
        },
      ]

      test.each(cases)('Validator: $input.Validator.name', ({ input, expected }) => {
        const validator = input.Validator.create({
          input: {},
          errorHash: {},
        })

        expect(() => validator.generateValidationEntries())
          .toThrow(expected)
      })
    })
  })
})

/**
 * @typedef {import('../../../../../app/validator/forResolver/BaseInputValidator.js').ValidationEntry} ValidationEntry
 */
