import SignInMutationResolver from '../../../../../../../../server/graphql/resolvers/admin/actual/mutations/SignInMutationResolver.js'

import SessionClerk from '../../../../../../../../app/session/SessionClerk.js'
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
          IncorrectSecret: '202.M004.001',
        }

        const received = SignInMutationResolver.errorCodeHash

        expect(received)
          .toEqual(expected)
      })
    })
  })
})

describe('SignInMutationResolver', () => {
  describe('.get:RefreshTokenExpressCookieClerkCtor', () => {
    describe('when called as is', () => {
      test('should be fixed value', () => {
        const received = SignInMutationResolver.RefreshTokenExpressCookieClerkCtor

        expect(received)
          .toBe(RefreshTokenExpressCookieClerk) // same reference
      })
    })
  })
})

describe('SignInMutationResolver', () => {
  describe('.get:SessionClerkCtor', () => {
    describe('when called as is', () => {
      test('should be fixed value', () => {
        const received = SignInMutationResolver.SessionClerkCtor

        expect(received)
          .toBe(SessionClerk) // same reference
      })
    })
  })
})

describe('SignInMutationResolver', () => {
  describe('#get:Ctor', () => {
    describe('when called as is', () => {
      test('should be own class', () => {
        const resolver = SignInMutationResolver.create()

        const received = resolver.Ctor

        expect(received)
          .toBe(SignInMutationResolver) // same reference
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
          params: {
            context: /** @type {*} */ ({
              id: 'context-01',
            }),
          },
        },
        {
          params: {
            context: /** @type {*} */ ({
              id: 'context-02',
            }),
          },
        },
      ]

      test.each(cases)('context: $params.context.id', ({ params }) => {
        const received = resolver.createCookieClerk(params)

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
          params: {
            email: 'admin.100001@example.com',
          },
          expected: expect.objectContaining({
            AdminId: 100001,
            passwordHash: expect.stringMatching(/^\$2b\$10\$.{53}$/u),
            savedAt: new Date('2024-01-01T00:00:01.001Z'),
          }),
        },
        {
          params: {
            email: 'admin.100002@example.com',
          },
          expected: expect.objectContaining({
            AdminId: 100002,
            passwordHash: expect.stringMatching(/^\$2b\$10\$.{53}$/u),
            savedAt: new Date('2024-01-02T00:00:02.002Z'),
          }),
        },
      ]

      test.each(cases)('email: $params.email', async ({
        params,
        expected,
      }) => {
        const PasswordHash = await resolver.findPasswordHashByEmail(params)
        const received = PasswordHash.dataValues

        expect(received)
          .toEqual(expected)
      })
    })

    describe('with non-existing email', () => {
      const cases = [
        {
          params: {
            email: 'unknown.100001@example.com',
          },
        },
        {
          params: {
            email: 'unknown.100002@example.com',
          },
        },
      ]

      test.each(cases)('email: $params.email', async ({ params }) => {
        const received = await resolver.findPasswordHashByEmail(params)

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
          params: {
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
          params: {
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

      test.each(cases)('accessToken: $params.credentialPair.accessTokenEntity.accessToken', ({
        params,
        expected,
      }) => {
        const received = resolver.formatResponse(params)

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
          params: {
            variables: {
              input: {
                email: 'admin.100001@example.com',
                password: 'incorrect-password-value', // wrong password for a real account
              },
            },
            context: /** @type {*} */ ({
              now: new Date('2026-08-01T00:00:01.001Z'),
            }),
          },
        },
        {
          params: {
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

      test.each(cases)('email: $params.variables.input.email', async ({ params }) => {
        const actual = () => resolver.resolve(params)

        await expect(actual)
          .rejects
          .toThrow('202.M004.001')
      })
    })
  })
})
