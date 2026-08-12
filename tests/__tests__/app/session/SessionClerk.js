import SessionClerk from '../../../../app/session/SessionClerk.js'

import SessionCredentialGenerator from '../../../../app/session/SessionCredentialGenerator.js'
import SavingSessionResult from '../../../../app/session/SavingSessionResult.js'
import RevokingSessionResult from '../../../../app/session/RevokingSessionResult.js'

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
            credentialGenerator: SessionCredentialGenerator.create(),
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
            credentialGenerator: SessionCredentialGenerator.create(),
          }
          const expected = CustomerRefreshToken

          const clerk = new SessionClerk(args)

          expect(clerk)
            .toHaveProperty('RefreshTokenModel', expected)
        })
      })

      describe('#credentialGenerator', () => {
        const cases = [
          {
            input: {
              credentialGenerator: SessionCredentialGenerator.create({
                tokenByteSize: 101,
              }),
            },
            expected: SessionCredentialGenerator.create({
              tokenByteSize: 101,
            }),
          },
          {
            input: {
              credentialGenerator: SessionCredentialGenerator.create({
                tokenByteSize: 202,
              }),
            },
            expected: SessionCredentialGenerator.create({
              tokenByteSize: 202,
            }),
          },
        ]

        test.each(cases)('credentialGenerator: $input.credentialGenerator.tokenByteSize', ({
          input,
          expected,
        }) => {
          const args = {
            AccessTokenModel: CustomerAccessToken,
            RefreshTokenModel: CustomerRefreshToken,
            credentialGenerator: input.credentialGenerator,
          }

          const clerk = new SessionClerk(args)

          expect(clerk)
            .toHaveProperty('credentialGenerator', expected)
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
            credentialGenerator: SessionCredentialGenerator.create({
              tokenByteSize: 101,
            }),
          },
        },
        {
          input: {
            AccessTokenModel: CustomerAccessToken,
            RefreshTokenModel: CustomerRefreshToken,
            credentialGenerator: SessionCredentialGenerator.create({
              tokenByteSize: 202,
            }),
          },
        },
      ]

      test.each(cases)('credentialGenerator: $input.credentialGenerator.tokenByteSize', ({ input }) => {
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
            credentialGenerator: SessionCredentialGenerator.create({
              tokenByteSize: 101,
            }),
          },
        },
        {
          tally: {
            AccessTokenModel: CustomerAccessToken,
            RefreshTokenModel: CustomerRefreshToken,
            credentialGenerator: SessionCredentialGenerator.create({
              tokenByteSize: 202,
            }),
          },
        },
      ]

      test.each(cases)('credentialGenerator: $tally.credentialGenerator.tokenByteSize', ({ tally }) => {
        const SpyClass = globalThis.constructorSpy.spyOn(SessionClerk)

        SpyClass.create(tally)

        expect(SpyClass.__spy__)
          .toHaveBeenCalledWith(tally)
      })
    })

    describe('should fill default credentialGenerator', () => {
      test('with no credential clerk', () => {
        const credentialGenerator = SessionCredentialGenerator.create()
        const expected = {
          AccessTokenModel: CustomerAccessToken,
          RefreshTokenModel: CustomerRefreshToken,
          credentialGenerator,
        }
        const input = {
          AccessTokenModel: CustomerAccessToken,
          RefreshTokenModel: CustomerRefreshToken,
          // credentialGenerator: omitted → falls back to the default
        }

        jest.spyOn(SessionClerk, 'createCredentialGenerator')
          .mockReturnValue(credentialGenerator)
        const SpyClass = globalThis.constructorSpy.spyOn(SessionClerk)

        SpyClass.create(input)

        expect(SpyClass.__spy__)
          .toHaveBeenCalledWith(expected)
      })
    })
  })
})

describe('SessionClerk', () => {
  describe('.get:SessionCredentialGeneratorCtor', () => {
    describe('when called as is', () => {
      test('should be fixed value', () => {
        const received = SessionClerk.SessionCredentialGeneratorCtor

        expect(received)
          .toBe(SessionCredentialGenerator) // same reference
      })
    })
  })
})

describe('SessionClerk', () => {
  describe('.get:RevokingSessionResultCtor', () => {
    describe('when called as is', () => {
      test('should be fixed value', () => {
        const received = SessionClerk.RevokingSessionResultCtor

        expect(received)
          .toBe(RevokingSessionResult) // same reference
      })
    })
  })
})

describe('SessionClerk', () => {
  describe('.get:SavingSessionResultCtor', () => {
    describe('when called as is', () => {
      test('should be fixed value', () => {
        const received = SessionClerk.SavingSessionResultCtor

        expect(received)
          .toBe(SavingSessionResult) // same reference
      })
    })
  })
})

describe('SessionClerk', () => {
  describe('#get:Ctor', () => {
    describe('when called as is', () => {
      test('should be fixed value', () => {
        const clerk = SessionClerk.create({
          AccessTokenModel: CustomerAccessToken,
          RefreshTokenModel: CustomerRefreshToken,
        })

        const received = clerk.Ctor

        expect(received)
          .toBe(SessionClerk) // same reference
      })
    })
  })
})

describe('SessionClerk', () => {
  describe('.createCredentialGenerator()', () => {
    describe('when called as is', () => {
      test('should be a session credential clerk', () => {
        const received = SessionClerk.createCredentialGenerator()

        expect(received)
          .toBeInstanceOf(SessionCredentialGenerator)
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
  describe('.createSavingSessionResult()', () => {
    describe('should be a saving-session result', () => {
      const cases = [
        {
          input: {
            error: new Error('saving-result-error-01'),
          },
        },
        {
          input: {
            error: new Error('saving-result-error-02'),
          },
        },
      ]

      test.each(cases)('error: $input.error.message', ({ input }) => {
        const received = SessionClerk.createSavingSessionResult(input)

        expect(received)
          .toBeInstanceOf(SavingSessionResult)
      })
    })
  })
})

describe('SessionClerk', () => {
  describe('.createRevokingSessionResult()', () => {
    describe('should be a revoking-session result', () => {
      const cases = [
        {
          input: {
            error: new Error('revocation-result-error-01'),
          },
        },
        {
          input: {
            error: new Error('revocation-result-error-02'),
          },
        },
      ]

      test.each(cases)('error: $input.error.message', ({ input }) => {
        const received = SessionClerk.createRevokingSessionResult(input)

        expect(received)
          .toBeInstanceOf(RevokingSessionResult)
      })
    })
  })
})
