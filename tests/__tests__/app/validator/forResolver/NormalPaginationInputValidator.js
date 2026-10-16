import NormalPaginationInputValidator from '../../../../../app/validator/forResolver/NormalPaginationInputValidator.js'

import {
  IntegerValueInspector,
} from '@openreachtech/mentsu-value-inspector'

describe('NormalPaginationInputValidator', () => {
  describe('constructor', () => {
    describe('should keep property', () => {
      describe('#input', () => {
        /**
         * @type {Array<{
         *   tally: import('../../../../../app/validator/forResolver/NormalPaginationInputValidator.js').PaginatedInput
         * }>}
         */
        const cases = [
          {
            tally: {
              pagination: {
                limit: 10,
                offset: 0,
              },
            },
          },
          {
            tally: {
              pagination: {
                limit: 20,
                offset: 40,
                sort: {
                  targetColumn: 'column-0001',
                  orderBy: 'DESC',
                },
              },
            },
          },
        ]

        test.each(cases)('input: $tally.pagination.limit', ({ tally }) => {
          const args = {
            input: tally,
            validColumns: [], // neutral value; not under test
          }

          const received = new NormalPaginationInputValidator(args)

          expect(received)
            .toHaveProperty('input', tally)
        })
      })

      describe('#validColumns', () => {
        const cases = [
          {
            tally: [
              'column-0001',
              'column-0002',
            ],
          },
          {
            tally: [],
          },
        ]

        test.each(cases)('validColumns: $tally', ({ tally }) => {
          const args = {
            input: {}, // neutral value; not under test
            validColumns: tally,
          }

          const received = new NormalPaginationInputValidator(args)

          expect(received)
            .toHaveProperty('validColumns', tally)
        })
      })
    })
  })
})

describe('NormalPaginationInputValidator', () => {
  describe('.create()', () => {
    describe('should be an instance of own class', () => {
      const cases = [
        {
          input: {
            input: {
              pagination: {
                limit: 10,
                offset: 0,
              },
            },
            validColumns: [
              'column-0001',
            ],
          },
        },
        {
          input: {
            input: {},
          },
        },
      ]

      test.each(cases)('validColumns: $input.validColumns', ({ input }) => {
        const received = NormalPaginationInputValidator.create(input)

        expect(received)
          .toBeInstanceOf(NormalPaginationInputValidator)
      })
    })

    describe('should call constructor', () => {
      const cases = [
        {
          tally: {
            input: {
              pagination: {
                limit: 10,
                offset: 0,
              },
            },
            validColumns: [
              'column-0001',
            ],
          },
        },
        {
          tally: {
            input: {
              pagination: {
                limit: 20,
                offset: 40,
              },
            },
            validColumns: [
              'column-0002',
              'column-0003',
            ],
          },
        },
      ]

      test.each(cases)('validColumns: $tally.validColumns', ({ tally }) => {
        const SpyClass = globalThis.constructorSpy.spyOn(NormalPaginationInputValidator)

        SpyClass.create(tally)

        expect(SpyClass.__spy__)
          .toHaveBeenCalledWith(tally)
      })
    })

    describe('should fill default validColumns', () => {
      test('with no validColumns', () => {
        const input = {
          pagination: {
            limit: 10,
            offset: 0,
          },
        }
        const expected = {
          input,
          validColumns: [],
        }

        const SpyClass = globalThis.constructorSpy.spyOn(NormalPaginationInputValidator)

        SpyClass.create({
          input,
        })

        expect(SpyClass.__spy__)
          .toHaveBeenCalledWith(expected)
      })
    })
  })
})

describe('NormalPaginationInputValidator', () => {
  describe('.get:IntegerValueInspectorCtor', () => {
    describe('when called as is', () => {
      test('should be fixed value', () => {
        expect(NormalPaginationInputValidator.IntegerValueInspectorCtor)
          .toBe(IntegerValueInspector)
      })
    })
  })
})

describe('NormalPaginationInputValidator', () => {
  describe('.get:SORT_DIRECTIONS', () => {
    describe('when called as is', () => {
      test('should be fixed value', () => {
        const expected = [
          'ASC',
          'DESC',
        ]

        expect(NormalPaginationInputValidator.SORT_DIRECTIONS)
          .toEqual(expected)
      })
    })
  })
})

describe('NormalPaginationInputValidator', () => {
  describe('#get:Ctor', () => {
    class AlphaPaginationInputValidator extends NormalPaginationInputValidator {}

    const cases = [
      {
        tally: NormalPaginationInputValidator,
      },
      {
        tally: AlphaPaginationInputValidator,
      },
    ]

    test.each(cases)('Validator: $tally.name', ({ tally }) => {
      const validator = tally.create({
        input: {},
      })

      const received = validator.Ctor

      expect(received)
        .toBe(tally) // same reference
    })
  })
})

describe('NormalPaginationInputValidator', () => {
  describe('#get:pagination', () => {
    describe('with pagination', () => {
      /**
       * @type {Array<{
       *   tally: import('../../../../../app/validator/forResolver/NormalPaginationInputValidator.js').PaginationInput
       * }>}
       */
      const cases = [
        {
          tally: {
            limit: 10,
            offset: 0,
          },
        },
        {
          tally: {
            limit: 20,
            offset: 40,
            sort: {
              targetColumn: 'column-0001',
              orderBy: 'ASC',
            },
          },
        },
      ]

      test.each(cases)('limit: $tally.limit', ({ tally }) => {
        const validator = NormalPaginationInputValidator.create({
          input: {
            pagination: tally,
          },
        })

        const received = validator.pagination

        expect(received)
          .toBe(tally) // same reference
      })
    })

    describe('without pagination', () => {
      /**
       * @type {Array<{
       *   input: {
       *     input: *
       *   }
       * }>}
       */
      const cases = [
        {
          input: {
            input: {
              pagination: null,
            },
          },
        },
        {
          input: {
            input: {
              // pagination: omitted
            },
          },
        },
        {
          input: {
            input: null,
          },
        },
      ]

      test.each(cases)('input: $input.input', ({ input }) => {
        const validator = NormalPaginationInputValidator.create(input)

        const received = validator.pagination

        expect(received)
          .toBeNull()
      })
    })
  })
})

describe('NormalPaginationInputValidator', () => {
  describe('#get:limit', () => {
    /**
     * @type {Array<{
     *   input: {
     *     pagination: *
     *   }
     *   expected: number | string | null
     * }>}
     */
    const cases = [
      {
        input: {
          pagination: {
            limit: 10,
            offset: 0,
          },
        },
        expected: 10,
      },
      {
        input: {
          pagination: {
            limit: '20',
            offset: 0,
          },
        },
        expected: '20',
      },
      {
        input: {
          pagination: null,
        },
        expected: null,
      },
    ]

    test.each(cases)('pagination: $input.pagination', ({ input, expected }) => {
      const validator = NormalPaginationInputValidator.create({
        input,
      })

      const received = validator.limit

      expect(received)
        .toBe(expected)
    })
  })
})

describe('NormalPaginationInputValidator', () => {
  describe('#get:offset', () => {
    /**
     * @type {Array<{
     *   input: {
     *     pagination: *
     *   }
     *   expected: number | string | null
     * }>}
     */
    const cases = [
      {
        input: {
          pagination: {
            limit: 10,
            offset: 30,
          },
        },
        expected: 30,
      },
      {
        input: {
          pagination: {
            limit: 10,
            offset: '40',
          },
        },
        expected: '40',
      },
      {
        input: {
          pagination: null,
        },
        expected: null,
      },
    ]

    test.each(cases)('pagination: $input.pagination', ({ input, expected }) => {
      const validator = NormalPaginationInputValidator.create({
        input,
      })

      const received = validator.offset

      expect(received)
        .toBe(expected)
    })
  })
})

describe('NormalPaginationInputValidator', () => {
  describe('#get:sort', () => {
    describe('with sort', () => {
      /**
       * @type {Array<{
       *   tally: import('../../../../../app/validator/forResolver/NormalPaginationInputValidator.js').SortInput
       * }>}
       */
      const cases = [
        {
          tally: {
            targetColumn: 'column-0001',
            orderBy: 'ASC',
          },
        },
        {
          tally: {
            targetColumn: 'column-0002',
            orderBy: 'DESC',
          },
        },
      ]

      test.each(cases)('targetColumn: $tally.targetColumn', ({ tally }) => {
        const validator = NormalPaginationInputValidator.create({
          input: {
            pagination: {
              limit: 10,
              offset: 0,
              sort: tally,
            },
          },
        })

        const received = validator.sort

        expect(received)
          .toBe(tally) // same reference
      })
    })

    describe('without sort', () => {
      const cases = [
        {
          input: {
            pagination: {
              limit: 10,
              offset: 0,
              sort: null,
            },
          },
        },
        {
          input: {
            pagination: {
              limit: 10,
              offset: 0,
              // sort: omitted
            },
          },
        },
        {
          input: {
            pagination: null,
          },
        },
      ]

      test.each(cases)('pagination: $input.pagination', ({ input }) => {
        const validator = NormalPaginationInputValidator.create({
          input,
        })

        const received = validator.sort

        expect(received)
          .toBeNull()
      })
    })
  })
})

describe('NormalPaginationInputValidator', () => {
  describe('#isValidLimit()', () => {
    describe('should be truthy', () => {
      /**
       * @type {Array<{
       *   input: {
       *     limit: *
       *   }
       * }>}
       */
      const cases = [
        {
          input: {
            limit: 20,
          },
        },
        {
          input: {
            limit: 1, // minimum
          },
        },
        {
          input: {
            limit: 100, // maximum
          },
        },
        {
          input: {
            limit: '50', // numeric string
          },
        },
      ]

      test.each(cases)('limit: $input.limit', ({ input }) => {
        const validator = NormalPaginationInputValidator.create({
          input: {
            pagination: {
              limit: input.limit,
              offset: 0,
            },
          },
        })

        const received = validator.isValidLimit()

        expect(received)
          .toBeTruthy()
      })
    })

    describe('should be falsy', () => {
      /**
       * @type {Array<{
       *   input: {
       *     limit: *
       *   }
       * }>}
       */
      const cases = [
        {
          input: {
            limit: 101, // maximum + 1
          },
        },
        {
          input: {
            limit: 0, // minimum - 1
          },
        },
        {
          input: {
            limit: -1,
          },
        },
        {
          input: {
            limit: 1.5,
          },
        },
        {
          input: {
            limit: Number.MAX_SAFE_INTEGER,
          },
        },
        {
          input: {
            limit: Number.MAX_SAFE_INTEGER + 1,
          },
        },
        {
          input: {
            limit: 'limit-0001',
          },
        },
        {
          input: {
            limit: '', // read as 0 by the inspector
          },
        },
        {
          input: {
            limit: null,
          },
        },
        {
          input: {
            limit: undefined,
          },
        },
      ]

      test.each(cases)('limit: $input.limit', ({ input }) => {
        const validator = NormalPaginationInputValidator.create({
          input: {
            pagination: {
              limit: input.limit,
              offset: 0,
            },
          },
        })

        const received = validator.isValidLimit()

        expect(received)
          .toBeFalsy()
      })
    })

    describe('without pagination', () => {
      test('should be falsy', () => {
        const validator = NormalPaginationInputValidator.create({
          input: {},
        })

        const received = validator.isValidLimit()

        expect(received)
          .toBeFalsy()
      })
    })
  })
})

describe('NormalPaginationInputValidator', () => {
  describe('#createIntegerValueInspector()', () => {
    describe('should be an instance of IntegerValueInspector', () => {
      const cases = [
        {
          input: {
            value: 100001,
          },
        },
        {
          input: {
            value: '100002',
          },
        },
      ]

      test.each(cases)('value: $input.value', ({ input }) => {
        const validator = NormalPaginationInputValidator.create({
          input: {}, // neutral value; not under test
        })

        const received = validator.createIntegerValueInspector(input)

        expect(received)
          .toBeInstanceOf(IntegerValueInspector)
      })
    })

    describe('should inspect the given value', () => {
      const cases = [
        {
          input: {
            value: 100001,
          },
          expected: 100001,
        },
        {
          input: {
            value: '100002',
          },
          expected: 100002,
        },
      ]

      test.each(cases)('value: $input.value', ({ input, expected }) => {
        const validator = NormalPaginationInputValidator.create({
          input: {}, // neutral value; not under test
        })

        const inspector = validator.createIntegerValueInspector(input)
        const received = inspector.normalizeValue()

        expect(received)
          .toBe(expected)
      })
    })
  })
})

describe('NormalPaginationInputValidator', () => {
  describe('#isValidOffset()', () => {
    describe('should be truthy', () => {
      /**
       * @type {Array<{
       *   input: {
       *     offset: *
       *   }
       * }>}
       */
      const cases = [
        {
          input: {
            offset: 40,
          },
        },
        {
          input: {
            offset: 0, // minimum
          },
        },
        {
          input: {
            offset: '20', // numeric string
          },
        },
        {
          input: {
            offset: Number.MAX_SAFE_INTEGER,
          },
        },
      ]

      test.each(cases)('offset: $input.offset', ({ input }) => {
        const validator = NormalPaginationInputValidator.create({
          input: {
            pagination: {
              limit: 10,
              offset: input.offset,
            },
          },
        })

        const received = validator.isValidOffset()

        expect(received)
          .toBeTruthy()
      })
    })

    describe('should be falsy', () => {
      /**
       * @type {Array<{
       *   input: {
       *     offset: *
       *   }
       * }>}
       */
      const cases = [
        {
          input: {
            offset: -1, // minimum - 1
          },
        },
        {
          input: {
            offset: 1.5,
          },
        },
        {
          input: {
            offset: Number.MAX_SAFE_INTEGER + 1,
          },
        },
        {
          input: {
            offset: 'offset-0001',
          },
        },
        {
          input: {
            offset: '', // read as 0 by the inspector
          },
        },
        {
          input: {
            offset: null,
          },
        },
        {
          input: {
            offset: undefined,
          },
        },
      ]

      test.each(cases)('offset: $input.offset', ({ input }) => {
        const validator = NormalPaginationInputValidator.create({
          input: {
            pagination: {
              limit: 10,
              offset: input.offset,
            },
          },
        })

        const received = validator.isValidOffset()

        expect(received)
          .toBeFalsy()
      })
    })

    describe('without pagination', () => {
      test('should be falsy', () => {
        const validator = NormalPaginationInputValidator.create({
          input: {},
        })

        const received = validator.isValidOffset()

        expect(received)
          .toBeFalsy()
      })
    })
  })
})

describe('NormalPaginationInputValidator', () => {
  describe('#isValidSort()', () => {
    describe('should be truthy', () => {
      /**
       * @type {Array<{
       *   input: {
       *     sort: *
       *     validColumns: Array<string>
       *   }
       * }>}
       */
      const cases = [
        {
          input: {
            sort: {
              targetColumn: 'column-0001',
              orderBy: 'ASC',
            },
            validColumns: [
              'column-0001',
              'column-0002',
            ],
          },
        },
        {
          input: {
            sort: {
              targetColumn: 'column-0002',
              orderBy: 'DESC',
            },
            validColumns: [
              'column-0001',
              'column-0002',
            ],
          },
        },
        {
          input: {
            sort: null, // absent sort is valid
            validColumns: [
              'column-0001',
            ],
          },
        },
        {
          input: {
            sort: undefined, // omitted sort is valid
            validColumns: [],
          },
        },
      ]

      test.each(cases)('sort: $input.sort', ({ input }) => {
        const validator = NormalPaginationInputValidator.create({
          input: {
            pagination: {
              limit: 10,
              offset: 0,
              sort: input.sort,
            },
          },
          validColumns: input.validColumns,
        })

        const received = validator.isValidSort()

        expect(received)
          .toBeTruthy()
      })
    })

    describe('should be falsy', () => {
      /**
       * @type {Array<{
       *   input: {
       *     sort: *
       *     validColumns: Array<string>
       *   }
       * }>}
       */
      const cases = [
        {
          input: {
            sort: {
              targetColumn: 'column-0003', // not a valid column
              orderBy: 'ASC',
            },
            validColumns: [
              'column-0001',
              'column-0002',
            ],
          },
        },
        {
          input: {
            sort: {
              targetColumn: 'column-0001',
              orderBy: 'asc', // not the enum value
            },
            validColumns: [
              'column-0001',
            ],
          },
        },
        {
          input: {
            sort: {
              targetColumn: 'column-0001',
              orderBy: 'RANDOM',
            },
            validColumns: [
              'column-0001',
            ],
          },
        },
        {
          input: {
            sort: {
              targetColumn: 'column-0001',
              orderBy: null,
            },
            validColumns: [
              'column-0001',
            ],
          },
        },
        {
          input: {
            sort: {
              targetColumn: null,
              orderBy: 'DESC',
            },
            validColumns: [
              'column-0001',
            ],
          },
        },
        {
          input: {
            sort: {
              targetColumn: 'column-0001',
              orderBy: 'ASC',
            },
            validColumns: [], // no column may be sorted by
          },
        },
      ]

      test.each(cases)('sort: $input.sort', ({ input }) => {
        const validator = NormalPaginationInputValidator.create({
          input: {
            pagination: {
              limit: 10,
              offset: 0,
              sort: input.sort,
            },
          },
          validColumns: input.validColumns,
        })

        const received = validator.isValidSort()

        expect(received)
          .toBeFalsy()
      })
    })
  })
})
