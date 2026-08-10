import SessionSavingResult from '../../../../app/auth/SessionSavingResult.js'

describe('SessionSavingResult', () => {
  describe('constructor', () => {
    describe('should keep property', () => {
      describe('#error', () => {
        const cases = [
          {
            input: {
              error: new Error('session-saving-error-01'),
            },
            expected: new Error('session-saving-error-01'),
          },
          {
            input: {
              error: new Error('session-saving-error-02'),
            },
            expected: new Error('session-saving-error-02'),
          },
        ]

        test.each(cases)('error: $input.error.message', ({
          input,
          expected,
        }) => {
          const args = {
            error: input.error,
            credentialPair: null,
          }

          const result = new SessionSavingResult(args)

          expect(result)
            .toHaveProperty('error', expected)
        })
      })

      describe('#credentialPair', () => {
        const cases = [
          {
            input: {
              credentialPair: /** @type {*} */ ({
                refreshToken: 'refresh-token-value-01',
              }),
            },
            expected: {
              refreshToken: 'refresh-token-value-01',
            },
          },
          {
            input: {
              credentialPair: /** @type {*} */ ({
                refreshToken: 'refresh-token-value-02',
              }),
            },
            expected: {
              refreshToken: 'refresh-token-value-02',
            },
          },
        ]

        test.each(cases)('credentialPair: $input.credentialPair.refreshToken', ({
          input,
          expected,
        }) => {
          const args = {
            error: null,
            credentialPair: input.credentialPair,
          }

          const result = new SessionSavingResult(args)

          expect(result)
            .toHaveProperty('credentialPair', expected)
        })
      })
    })
  })
})

describe('SessionSavingResult', () => {
  describe('.create()', () => {
    describe('should be an instance of own class', () => {
      const cases = [
        {
          input: {
            error: new Error('session-saving-error-03'),
            credentialPair: null,
          },
        },
        {
          input: {
            error: new Error('session-saving-error-04'),
            credentialPair: null,
          },
        },
      ]

      test.each(cases)('error: $input.error.message', ({ input }) => {
        const received = SessionSavingResult.create(input)

        expect(received)
          .toBeInstanceOf(SessionSavingResult)
      })
    })

    describe('should call constructor', () => {
      const cases = [
        {
          tally: {
            error: new Error('session-saving-error-05'),
            credentialPair: null,
          },
        },
        {
          tally: {
            error: new Error('session-saving-error-06'),
            credentialPair: null,
          },
        },
      ]

      test.each(cases)('error: $tally.error.message', ({ tally }) => {
        const SpyClass = globalThis.constructorSpy.spyOn(SessionSavingResult)

        SpyClass.create(tally)

        expect(SpyClass.__spy__)
          .toHaveBeenCalledWith(tally)
      })
    })
  })
})

describe('SessionSavingResult', () => {
  describe('#hasError()', () => {
    describe('should be truthy when an error is present', () => {
      const cases = [
        {
          input: {
            error: new Error('has-error-01'),
            credentialPair: null,
          },
        },
        {
          input: {
            error: new Error('has-error-02'),
            credentialPair: null,
          },
        },
      ]

      test.each(cases)('error: $input.error.message', ({ input }) => {
        const result = SessionSavingResult.create(input)

        const received = result.hasError()

        expect(received)
          .toBeTruthy()
      })
    })

    describe('should be falsy when there is no error', () => {
      const cases = [
        {
          input: {
            error: null,
            credentialPair: /** @type {*} */ ({
              refreshToken: 'refresh-token-value-07',
            }),
          },
        },
        {
          input: {
            error: null,
            credentialPair: /** @type {*} */ ({
              refreshToken: 'refresh-token-value-08',
            }),
          },
        },
      ]

      test.each(cases)('credentialPair: $input.credentialPair.refreshToken', ({ input }) => {
        const result = SessionSavingResult.create(input)

        const received = result.hasError()

        expect(received)
          .toBeFalsy()
      })
    })
  })
})

describe('SessionSavingResult', () => {
  describe('#extractErrorMessage()', () => {
    describe('should be the caught error message', () => {
      const cases = [
        {
          input: {
            error: new Error('extract-message-01'),
            credentialPair: null,
          },
          expected: 'extract-message-01',
        },
        {
          input: {
            error: new Error('extract-message-02'),
            credentialPair: null,
          },
          expected: 'extract-message-02',
        },
      ]

      test.each(cases)('error: $input.error.message', ({
        input,
        expected,
      }) => {
        const result = SessionSavingResult.create(input)

        const received = result.extractErrorMessage()

        expect(received)
          .toBe(expected)
      })
    })
  })
})

