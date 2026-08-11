import BaseSessionResult from '../../../../app/session/BaseSessionResult.js'

describe('BaseSessionResult', () => {
  describe('constructor', () => {
    describe('should keep property', () => {
      describe('#response', () => {
        const cases = [
          {
            input: {
              response: {
                label: 'base-session-response-01',
              },
            },
            expected: {
              label: 'base-session-response-01',
            },
          },
          {
            input: {
              response: {
                label: 'base-session-response-02',
              },
            },
            expected: {
              label: 'base-session-response-02',
            },
          },
        ]

        test.each(cases)('response: $input.response.label', ({
          input,
          expected,
        }) => {
          const args = {
            response: input.response,
            error: null,
          }

          const result = new BaseSessionResult(args)

          expect(result)
            .toHaveProperty('response', expected)
        })
      })

      describe('#error', () => {
        const cases = [
          {
            input: {
              error: new Error('base-session-error-01'),
            },
            expected: new Error('base-session-error-01'),
          },
          {
            input: {
              error: new Error('base-session-error-02'),
            },
            expected: new Error('base-session-error-02'),
          },
        ]

        test.each(cases)('error: $input.error.message', ({
          input,
          expected,
        }) => {
          const args = {
            response: null,
            error: input.error,
          }

          const result = new BaseSessionResult(args)

          expect(result)
            .toHaveProperty('error', expected)
        })
      })
    })
  })
})

describe('BaseSessionResult', () => {
  describe('.create()', () => {
    describe('should be an instance of own class', () => {
      const cases = [
        {
          input: {
            error: new Error('base-session-error-03'),
          },
        },
        {
          input: {
            error: new Error('base-session-error-04'),
          },
        },
      ]

      test.each(cases)('error: $input.error.message', ({ input }) => {
        const received = BaseSessionResult.create(input)

        expect(received)
          .toBeInstanceOf(BaseSessionResult)
      })
    })

    describe('should call constructor', () => {
      const cases = [
        {
          tally: {
            response: null,
            error: new Error('base-session-error-05'),
          },
        },
        {
          tally: {
            response: null,
            error: new Error('base-session-error-06'),
          },
        },
      ]

      test.each(cases)('error: $tally.error.message', ({ tally }) => {
        const SpyClass = globalThis.constructorSpy.spyOn(BaseSessionResult)

        SpyClass.create(tally)

        expect(SpyClass.__spy__)
          .toHaveBeenCalledWith(tally)
      })
    })

    describe('should fill default response and error', () => {
      test('with no field passed', () => {
        const expected = {
          response: null,
          error: null,
        }

        const SpyClass = globalThis.constructorSpy.spyOn(BaseSessionResult)

        SpyClass.create({})

        expect(SpyClass.__spy__)
          .toHaveBeenCalledWith(expected)
      })
    })
  })
})

describe('BaseSessionResult', () => {
  describe('#hasError()', () => {
    describe('should be truthy when an error is present', () => {
      const cases = [
        {
          input: {
            error: new Error('has-error-01'),
          },
        },
        {
          input: {
            error: new Error('has-error-02'),
          },
        },
      ]

      test.each(cases)('error: $input.error.message', ({ input }) => {
        const result = BaseSessionResult.create(input)

        const received = result.hasError()

        expect(received)
          .toBeTruthy()
      })
    })

    describe('should be falsy when there is no error', () => {
      const cases = [
        {
          input: {
            response: {
              label: 'no-error-response-01',
            },
          },
        },
        {
          input: {
            response: {
              label: 'no-error-response-02',
            },
          },
        },
      ]

      test.each(cases)('response: $input.response.label', ({ input }) => {
        const result = BaseSessionResult.create(input)

        const received = result.hasError()

        expect(received)
          .toBeFalsy()
      })
    })
  })
})

describe('BaseSessionResult', () => {
  describe('#extractErrorMessage()', () => {
    describe('should be the caught error message', () => {
      const cases = [
        {
          input: {
            error: new Error('extract-message-01'),
          },
          expected: 'extract-message-01',
        },
        {
          input: {
            error: new Error('extract-message-02'),
          },
          expected: 'extract-message-02',
        },
      ]

      test.each(cases)('error: $input.error.message', ({
        input,
        expected,
      }) => {
        const result = BaseSessionResult.create(input)

        const received = result.extractErrorMessage()

        expect(received)
          .toBe(expected)
      })
    })
  })
})
