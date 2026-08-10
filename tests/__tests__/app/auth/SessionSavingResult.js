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
