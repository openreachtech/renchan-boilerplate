import SessionClerk from '../../../../app/auth/SessionClerk.js'

import SessionCredentialClerk from '../../../../app/auth/SessionCredentialClerk.js'
import SessionSavingResult from '../../../../app/auth/SessionSavingResult.js'
import SessionRevocationResult from '../../../../app/auth/SessionRevocationResult.js'

import CustomerAccessToken from '../../../../sequelize/models/CustomerAccessToken.js'
import CustomerRefreshToken from '../../../../sequelize/models/CustomerRefreshToken.js'

describe('SessionClerk', () => {
  describe('constructor', () => {
    describe('should keep property', () => {
      describe('#AccessTokenModel', () => {
        test('is the passed access token model', () => {
          const args = {
            AccessTokenModel: CustomerAccessToken,
            RefreshTokenModel: CustomerRefreshToken,
            credentialClerk: SessionCredentialClerk.create(),
          }
          const expected = CustomerAccessToken

          const clerk = new SessionClerk(args)

          expect(clerk)
            .toHaveProperty('AccessTokenModel', expected)
        })
      })

      describe('#RefreshTokenModel', () => {
        test('is the passed refresh token model', () => {
          const args = {
            AccessTokenModel: CustomerAccessToken,
            RefreshTokenModel: CustomerRefreshToken,
            credentialClerk: SessionCredentialClerk.create(),
          }
          const expected = CustomerRefreshToken

          const clerk = new SessionClerk(args)

          expect(clerk)
            .toHaveProperty('RefreshTokenModel', expected)
        })
      })

      describe('#credentialClerk', () => {
        const cases = [
          {
            input: {
              credentialClerk: SessionCredentialClerk.create({
                tokenByteSize: 101,
              }),
            },
            expected: SessionCredentialClerk.create({
              tokenByteSize: 101,
            }),
          },
          {
            input: {
              credentialClerk: SessionCredentialClerk.create({
                tokenByteSize: 202,
              }),
            },
            expected: SessionCredentialClerk.create({
              tokenByteSize: 202,
            }),
          },
        ]

        test.each(cases)('credentialClerk: $input.credentialClerk.tokenByteSize', ({
          input,
          expected,
        }) => {
          const args = {
            AccessTokenModel: CustomerAccessToken,
            RefreshTokenModel: CustomerRefreshToken,
            credentialClerk: input.credentialClerk,
          }

          const clerk = new SessionClerk(args)

          expect(clerk)
            .toHaveProperty('credentialClerk', expected)
        })
      })
    })
  })
})

describe('SessionClerk', () => {
  describe('.create()', () => {
    describe('should be an instance of own class', () => {
      const cases = [
        {
          input: {
            AccessTokenModel: CustomerAccessToken,
            RefreshTokenModel: CustomerRefreshToken,
            credentialClerk: SessionCredentialClerk.create({
              tokenByteSize: 101,
            }),
          },
        },
        {
          input: {
            AccessTokenModel: CustomerAccessToken,
            RefreshTokenModel: CustomerRefreshToken,
            credentialClerk: SessionCredentialClerk.create({
              tokenByteSize: 202,
            }),
          },
        },
      ]

      test.each(cases)('credentialClerk: $input.credentialClerk.tokenByteSize', ({ input }) => {
        const received = SessionClerk.create(input)

        expect(received)
          .toBeInstanceOf(SessionClerk)
      })
    })

    describe('should call constructor', () => {
      const cases = [
        {
          tally: {
            AccessTokenModel: CustomerAccessToken,
            RefreshTokenModel: CustomerRefreshToken,
            credentialClerk: SessionCredentialClerk.create({
              tokenByteSize: 101,
            }),
          },
        },
        {
          tally: {
            AccessTokenModel: CustomerAccessToken,
            RefreshTokenModel: CustomerRefreshToken,
            credentialClerk: SessionCredentialClerk.create({
              tokenByteSize: 202,
            }),
          },
        },
      ]

      test.each(cases)('credentialClerk: $tally.credentialClerk.tokenByteSize', ({ tally }) => {
        const SpyClass = globalThis.constructorSpy.spyOn(SessionClerk)

        SpyClass.create(tally)

        expect(SpyClass.__spy__)
          .toHaveBeenCalledWith(tally)
      })
    })

    describe('should fill default credentialClerk', () => {
      test('with no credential clerk', () => {
        const credentialClerk = SessionCredentialClerk.create()
        const expected = {
          AccessTokenModel: CustomerAccessToken,
          RefreshTokenModel: CustomerRefreshToken,
          credentialClerk,
        }
        const input = {
          AccessTokenModel: CustomerAccessToken,
          RefreshTokenModel: CustomerRefreshToken,
          // credentialClerk: omitted → falls back to the default
        }

        jest.spyOn(SessionClerk, 'createCredentialClerk')
          .mockReturnValue(credentialClerk)
        const SpyClass = globalThis.constructorSpy.spyOn(SessionClerk)

        SpyClass.create(input)

        expect(SpyClass.__spy__)
          .toHaveBeenCalledWith(expected)
      })
    })
  })
})

describe('SessionClerk', () => {
  describe('.get:SessionCredentialClerkCtor', () => {
    describe('when called as is', () => {
      test('should be fixed value', () => {
        const received = SessionClerk.SessionCredentialClerkCtor

        expect(received)
          .toBe(SessionCredentialClerk) // same reference
      })
    })
  })
})

describe('SessionClerk', () => {
  describe('.createCredentialClerk()', () => {
    describe('when called as is', () => {
      test('should be a session credential clerk', () => {
        const received = SessionClerk.createCredentialClerk()

        expect(received)
          .toBeInstanceOf(SessionCredentialClerk)
      })
    })
  })
})

describe('SessionClerk', () => {
  describe('#findRefreshToken()', () => {
    const clerk = SessionClerk.create({
      AccessTokenModel: CustomerAccessToken,
      RefreshTokenModel: CustomerRefreshToken,
    })

    describe('should answer the seeded row a presented token hashes to', () => {
      const cases = [
        {
          input: {
            refreshToken: 'refresh-token-01-01', // seeded: active
          },
          expected: 'session-key-01-01',
        },
        {
          input: {
            refreshToken: 'refresh-token-02-02', // seeded: active
          },
          expected: 'session-key-02-02',
        },
      ]

      test.each(cases)('refreshToken: $input.refreshToken', async ({
        input,
        expected,
      }) => {
        const RefreshToken = await clerk.findRefreshToken(input)
        const received = RefreshToken.sessionKey

        expect(received)
          .toBe(expected)
      })
    })

    describe('should be null when the presented token matches no row', () => {
      const cases = [
        {
          input: {
            refreshToken: 'unmatched-refresh-token-value-0001',
          },
        },
        {
          input: {
            refreshToken: 'unmatched-refresh-token-value-0002',
          },
        },
      ]

      test.each(cases)('refreshToken: $input.refreshToken', async ({ input }) => {
        const received = await clerk.findRefreshToken(input)

        expect(received)
          .toBeNull()
      })
    })

    describe('should not query when no token is presented', () => {
      const cases = [
        {
          input: {
            refreshToken: null,
          },
        },
        {
          input: {
            refreshToken: '',
          },
        },
      ]

      test.each(cases)('refreshToken: $input.refreshToken', async ({ input }) => {
        const findOneSpy = jest.spyOn(CustomerRefreshToken, 'findOne')

        await clerk.findRefreshToken(input)

        expect(findOneSpy)
          .not
          .toHaveBeenCalled()
      })
    })
  })
})

describe('SessionClerk', () => {
  describe('#createSavingResult()', () => {
    const clerk = SessionClerk.create({
      AccessTokenModel: CustomerAccessToken,
      RefreshTokenModel: CustomerRefreshToken,
    })

    describe('should be a session saving result', () => {
      const cases = [
        {
          input: {
            error: new Error('saving-result-error-01'),
            credentialPair: null,
          },
        },
        {
          input: {
            error: new Error('saving-result-error-02'),
            credentialPair: null,
          },
        },
      ]

      test.each(cases)('error: $input.error.message', ({ input }) => {
        const received = clerk.createSavingResult(input)

        expect(received)
          .toBeInstanceOf(SessionSavingResult)
      })
    })
  })
})

describe('SessionClerk', () => {
  describe('#createRevocationResult()', () => {
    const clerk = SessionClerk.create({
      AccessTokenModel: CustomerAccessToken,
      RefreshTokenModel: CustomerRefreshToken,
    })

    describe('should be a session revocation result', () => {
      const cases = [
        {
          input: {
            error: new Error('revocation-result-error-01'),
            revocation: null,
          },
        },
        {
          input: {
            error: new Error('revocation-result-error-02'),
            revocation: null,
          },
        },
      ]

      test.each(cases)('error: $input.error.message', ({ input }) => {
        const received = clerk.createRevocationResult(input)

        expect(received)
          .toBeInstanceOf(SessionRevocationResult)
      })
    })
  })
})
