import SavingSessionResult from '../../../../app/session/SavingSessionResult.js'

import BaseSessionResult from '../../../../app/session/BaseSessionResult.js'

describe('SavingSessionResult', () => {
  describe('super class', () => {
    test('to be instance of BaseSessionResult', () => {
      const received = SavingSessionResult.prototype

      expect(received)
        .toBeInstanceOf(BaseSessionResult)
    })
  })
})

describe('SavingSessionResult', () => {
  describe('.create()', () => {
    describe('should be an instance of own class', () => {
      const cases = [
        {
          input: {
            error: new Error('saving-session-error-01'),
          },
        },
        {
          input: {
            error: new Error('saving-session-error-02'),
          },
        },
      ]

      test.each(cases)('error: $input.error.message', ({ input }) => {
        const received = SavingSessionResult.create(input)

        expect(received)
          .toBeInstanceOf(SavingSessionResult)
      })
    })

    describe('should call constructor', () => {
      const cases = [
        {
          tally: {
            response: null,
            error: new Error('saving-session-error-03'),
          },
        },
        {
          tally: {
            response: null,
            error: new Error('saving-session-error-04'),
          },
        },
      ]

      test.each(cases)('error: $tally.error.message', ({ tally }) => {
        const SpyClass = globalThis.constructorSpy.spyOn(SavingSessionResult)

        SpyClass.create(tally)

        expect(SpyClass.__spy__)
          .toHaveBeenCalledWith(tally)
      })
    })
  })
})

describe('SavingSessionResult', () => {
  describe('#get:credentialPair', () => {
    describe('should be the response held, by reference', () => {
      const cases = [
        {
          tally: {
            refreshToken: 'saving-response-ref-01',
          },
        },
        {
          tally: {
            refreshToken: 'saving-response-ref-02',
          },
        },
      ]

      test.each(cases)('response: $tally.refreshToken', ({ tally }) => {
        const result = SavingSessionResult.create({
          response: tally,
        })

        const received = result.credentialPair

        expect(received)
          .toBe(tally) // same reference
      })
    })
  })
})
