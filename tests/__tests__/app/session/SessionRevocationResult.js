import SessionRevocationResult from '../../../../app/session/SessionRevocationResult.js'

describe('SessionRevocationResult', () => {
  describe('constructor', () => {
    describe('should keep property', () => {
      describe('#error', () => {
        const cases = [
          {
            input: {
              error: new Error('session-revocation-error-01'),
            },
            expected: new Error('session-revocation-error-01'),
          },
          {
            input: {
              error: new Error('session-revocation-error-02'),
            },
            expected: new Error('session-revocation-error-02'),
          },
        ]

        test.each(cases)('error: $input.error.message', ({
          input,
          expected,
        }) => {
          const args = {
            error: input.error,
            revocation: null,
          }

          const result = new SessionRevocationResult(args)

          expect(result)
            .toHaveProperty('error', expected)
        })
      })

      describe('#revocation', () => {
        const cases = [
          {
            input: {
              revocation: {
                revokedRefreshTokenCount: 2,
                deletedAccessTokenCount: 3,
              },
            },
            expected: {
              revokedRefreshTokenCount: 2,
              deletedAccessTokenCount: 3,
            },
          },
          {
            input: {
              revocation: {
                revokedRefreshTokenCount: 4,
                deletedAccessTokenCount: 5,
              },
            },
            expected: {
              revokedRefreshTokenCount: 4,
              deletedAccessTokenCount: 5,
            },
          },
        ]

        test.each(cases)('revocation: $input.revocation.revokedRefreshTokenCount', ({
          input,
          expected,
        }) => {
          const args = {
            error: null,
            revocation: input.revocation,
          }

          const result = new SessionRevocationResult(args)

          expect(result)
            .toHaveProperty('revocation', expected)
        })
      })
    })
  })
})

describe('SessionRevocationResult', () => {
  describe('.create()', () => {
    describe('should be an instance of own class', () => {
      const cases = [
        {
          input: {
            error: new Error('session-revocation-error-03'),
            revocation: null,
          },
        },
        {
          input: {
            error: new Error('session-revocation-error-04'),
            revocation: null,
          },
        },
      ]

      test.each(cases)('error: $input.error.message', ({ input }) => {
        const received = SessionRevocationResult.create(input)

        expect(received)
          .toBeInstanceOf(SessionRevocationResult)
      })
    })

    describe('should call constructor', () => {
      const cases = [
        {
          tally: {
            error: new Error('session-revocation-error-05'),
            revocation: null,
          },
        },
        {
          tally: {
            error: new Error('session-revocation-error-06'),
            revocation: null,
          },
        },
      ]

      test.each(cases)('error: $tally.error.message', ({ tally }) => {
        const SpyClass = globalThis.constructorSpy.spyOn(SessionRevocationResult)

        SpyClass.create(tally)

        expect(SpyClass.__spy__)
          .toHaveBeenCalledWith(tally)
      })
    })
  })
})

describe('SessionRevocationResult', () => {
  describe('#hasError()', () => {
    describe('should be truthy when an error is present', () => {
      const cases = [
        {
          input: {
            error: new Error('has-error-01'),
            revocation: null,
          },
        },
        {
          input: {
            error: new Error('has-error-02'),
            revocation: null,
          },
        },
      ]

      test.each(cases)('error: $input.error.message', ({ input }) => {
        const result = SessionRevocationResult.create(input)

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
            revocation: {
              revokedRefreshTokenCount: 6,
              deletedAccessTokenCount: 7,
            },
          },
        },
        {
          input: {
            error: null,
            revocation: {
              revokedRefreshTokenCount: 8,
              deletedAccessTokenCount: 9,
            },
          },
        },
      ]

      test.each(cases)('revocation: $input.revocation.revokedRefreshTokenCount', ({ input }) => {
        const result = SessionRevocationResult.create(input)

        const received = result.hasError()

        expect(received)
          .toBeFalsy()
      })
    })
  })
})

describe('SessionRevocationResult', () => {
  describe('#extractErrorMessage()', () => {
    describe('should be the caught error message', () => {
      const cases = [
        {
          input: {
            error: new Error('extract-message-01'),
            revocation: null,
          },
          expected: 'extract-message-01',
        },
        {
          input: {
            error: new Error('extract-message-02'),
            revocation: null,
          },
          expected: 'extract-message-02',
        },
      ]

      test.each(cases)('error: $input.error.message', ({
        input,
        expected,
      }) => {
        const result = SessionRevocationResult.create(input)

        const received = result.extractErrorMessage()

        expect(received)
          .toBe(expected)
      })
    })
  })
})
