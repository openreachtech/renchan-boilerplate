import SignInMutationResolver from '../../../../../../../../server/graphql/resolvers/customer/actual/mutations/SignInMutationResolver.js'

import SessionClerk from '../../../../../../../../app/auth/SessionClerk.js'
import RefreshTokenExpressCookieClerk from '../../../../../../../../server/graphql/contexts/tools/RefreshTokenExpressCookieClerk.js'

describe('SignInMutationResolver', () => {
  describe('.get:schema', () => {
    describe('when called as is', () => {
      test('should be fixed value', () => {
        const received = SignInMutationResolver.schema

        expect(received)
          .toBe('signIn')
      })
    })
  })
})

describe('SignInMutationResolver', () => {
  describe('.get:errorCodeHash', () => {
    describe('when called as is', () => {
      test('should be fixed value', () => {
        const expected = {
          IncorrectSecret: '202.M002.001',
          FailedToSaveSession: '204.M002.001',
        }

        const received = SignInMutationResolver.errorCodeHash

        expect(received)
          .toEqual(expected)
      })
    })
  })
})

describe('SignInMutationResolver', () => {
  describe('#get:RefreshTokenExpressCookieClerkCtor', () => {
    describe('when called as is', () => {
      test('should be fixed value', () => {
        const resolver = SignInMutationResolver.create()

        const received = resolver.RefreshTokenExpressCookieClerkCtor

        expect(received)
          .toBe(RefreshTokenExpressCookieClerk) // same reference
      })
    })
  })
})

describe('SignInMutationResolver', () => {
  describe('#get:SessionClerkCtor', () => {
    describe('when called as is', () => {
      test('should be fixed value', () => {
        const resolver = SignInMutationResolver.create()

        const received = resolver.SessionClerkCtor

        expect(received)
          .toBe(SessionClerk) // same reference
      })
    })
  })
})

describe('SignInMutationResolver', () => {
  describe('#createSessionClerk()', () => {
    describe('when called as is', () => {
      test('should be a session clerk', () => {
        const resolver = SignInMutationResolver.create()

        const received = resolver.createSessionClerk()

        expect(received)
          .toBeInstanceOf(SessionClerk)
      })
    })
  })
})

describe('SignInMutationResolver', () => {
  describe('#createCookieClerk()', () => {
    describe('should be a refresh-token cookie clerk', () => {
      const resolver = SignInMutationResolver.create()

      const cases = [
        {
          input: {
            context: /** @type {*} */ ({
              id: 'context-01',
            }),
          },
        },
        {
          input: {
            context: /** @type {*} */ ({
              id: 'context-02',
            }),
          },
        },
      ]

      test.each(cases)('context: $input.context.id', ({ input }) => {
        const received = resolver.createCookieClerk(input)

        expect(received)
          .toBeInstanceOf(RefreshTokenExpressCookieClerk)
      })
    })
  })
})

describe('SignInMutationResolver', () => {
  describe('#findPasswordHashByEmail()', () => {
    const resolver = SignInMutationResolver.create()

    describe('with existing email', () => {
      const cases = [
        {
          input: {
            email: 'customer.100001@example.com',
          },
          expected: expect.objectContaining({
            CustomerId: 100001,
            passwordHash: expect.stringMatching(/^\$2b\$10\$.{53}$/u),
            savedAt: new Date('2024-01-01T00:00:01.001Z'),
          }),
        },
        {
          input: {
            email: 'customer.100002@example.com',
          },
          expected: expect.objectContaining({
            CustomerId: 100002,
            passwordHash: expect.stringMatching(/^\$2b\$10\$.{53}$/u),
            savedAt: new Date('2024-01-02T00:00:02.002Z'),
          }),
        },
      ]

      test.each(cases)('email: $input.email', async ({
        input,
        expected,
      }) => {
        const PasswordHash = await resolver.findPasswordHashByEmail(input)
        const received = PasswordHash.dataValues

        expect(received)
          .toEqual(expected)
      })
    })

    describe('with non-existing email', () => {
      const cases = [
        {
          input: {
            email: 'unknown.100001@example.com',
          },
        },
        {
          input: {
            email: 'unknown.100002@example.com',
          },
        },
      ]

      test.each(cases)('email: $input.email', async ({ input }) => {
        const received = await resolver.findPasswordHashByEmail(input)

        expect(received)
          .toBeNull()
      })
    })
  })
})

describe('SignInMutationResolver', () => {
  describe('#formatResponse()', () => {
    describe('should be the access token of the pair', () => {
      const resolver = SignInMutationResolver.create()

      const cases = [
        {
          input: {
            credentialPair: {
              accessTokenEntity: /** @type {*} */ ({
                accessToken: 'access-token-value-01',
              }),
            },
          },
          expected: {
            accessToken: 'access-token-value-01',
          },
        },
        {
          input: {
            credentialPair: {
              accessTokenEntity: /** @type {*} */ ({
                accessToken: 'access-token-value-02',
              }),
            },
          },
          expected: {
            accessToken: 'access-token-value-02',
          },
        },
      ]

      test.each(cases)('accessToken: $input.credentialPair.accessTokenEntity.accessToken', ({
        input,
        expected,
      }) => {
        const received = resolver.formatResponse(input)

        expect(received)
          .toEqual(expected)
      })
    })
  })
})

describe('SignInMutationResolver', () => {
  describe('#resolve()', () => {
    describe('should reject an incorrect credential', () => {
      const resolver = SignInMutationResolver.create()

      const cases = [
        {
          input: {
            variables: {
              input: {
                email: 'customer.100001@example.com',
                password: 'incorrect-password-value', // wrong password for a real account
              },
            },
            context: /** @type {*} */ ({
              now: new Date('2026-08-01T00:00:01.001Z'),
            }),
          },
        },
        {
          input: {
            variables: {
              input: {
                email: 'unmatched.email@example.com', // no account with this email
                password: 'pAsswOrd$02',
              },
            },
            context: /** @type {*} */ ({
              now: new Date('2026-08-02T00:00:02.002Z'),
            }),
          },
        },
      ]

      test.each(cases)('email: $input.variables.input.email', async ({ input }) => {
        const actual = () => resolver.resolve(input)

        await expect(actual)
          .rejects
          .toThrow('202.M002.001')
      })
    })
  })
})
