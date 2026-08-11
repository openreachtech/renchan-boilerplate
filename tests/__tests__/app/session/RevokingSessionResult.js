import RevokingSessionResult from '../../../../app/session/RevokingSessionResult.js'

import BaseSessionResult from '../../../../app/session/BaseSessionResult.js'

describe('RevokingSessionResult', () => {
  describe('super class', () => {
    test('to be instance of BaseSessionResult', () => {
      const received = RevokingSessionResult.prototype

      expect(received)
        .toBeInstanceOf(BaseSessionResult)
    })
  })
})

describe('RevokingSessionResult', () => {
  describe('.create()', () => {
    describe('should be an instance of own class', () => {
      const cases = [
        {
          input: {
            error: new Error('revoking-session-error-01'),
            response: null,
          },
        },
        {
          input: {
            error: new Error('revoking-session-error-02'),
            response: null,
          },
        },
      ]

      test.each(cases)('error: $input.error.message', ({ input }) => {
        const received = RevokingSessionResult.create(input)

        expect(received)
          .toBeInstanceOf(RevokingSessionResult)
      })
    })

    describe('should call constructor', () => {
      const cases = [
        {
          tally: {
            error: new Error('revoking-session-error-03'),
            response: null,
          },
        },
        {
          tally: {
            error: new Error('revoking-session-error-04'),
            response: null,
          },
        },
      ]

      test.each(cases)('error: $tally.error.message', ({ tally }) => {
        const SpyClass = globalThis.constructorSpy.spyOn(RevokingSessionResult)

        SpyClass.create(tally)

        expect(SpyClass.__spy__)
          .toHaveBeenCalledWith(tally)
      })
    })
  })
})

describe('RevokingSessionResult', () => {
  describe('#get:revocation', () => {
    describe('should be the response held, by reference', () => {
      const cases = [
        {
          tally: {
            revokedRefreshTokenCount: 2,
            deletedAccessTokenCount: 3,
          },
        },
        {
          tally: {
            revokedRefreshTokenCount: 4,
            deletedAccessTokenCount: 5,
          },
        },
      ]

      test.each(cases)('response: $tally.revokedRefreshTokenCount', ({ tally }) => {
        const result = RevokingSessionResult.create({
          error: null,
          response: tally,
        })

        const received = result.revocation

        expect(received)
          .toBe(tally) // same reference
      })
    })
  })
})
