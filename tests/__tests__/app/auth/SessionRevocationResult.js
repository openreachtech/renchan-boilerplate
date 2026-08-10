import SessionRevocationResult from '../../../../app/auth/SessionRevocationResult.js'

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
