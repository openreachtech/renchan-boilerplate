import SignInMutationResolver from '../../../../../../../../server/graphql/resolvers/admin/actual/mutations/SignInMutationResolver.js'

describe('SignInMutationResolver', () => {
  describe('.get:schema', () => {
    test('to be fixed value', () => {
      const actual = SignInMutationResolver.schema

      expect(actual)
        .toBe('signIn')
    })
  })
})

describe('SignInMutationResolver', () => {
  describe('.get:errorCodeHash', () => {
    test('to be fixed value', () => {
      const expected = {
        IncorrectSecret: '202.M001.001',
      }

      const actual = SignInMutationResolver.errorCodeHash

      expect(actual)
        .toEqual(expected)
    })
  })
})

describe('SignInMutationResolver', () => {
  describe('#findPasswordHashByEmail()', () => {
    describe('with existing email', () => {
      const passwordHashExpected = expect.stringMatching(/^\$2b\$10\$.{53}$/u)

      const cases = [
        {
          params: {
            email: 'admin.100001@example.com',
          },
          expected: {
            AdminId: 100001,
            passwordHash: passwordHashExpected,
            savedAt: new Date('2024-01-01T00:00:01.001Z'),
          },
        },
        {
          params: {
            email: 'admin.100002@example.com',
          },
          expected: {
            AdminId: 100002,
            passwordHash: passwordHashExpected,
            savedAt: new Date('2024-01-02T00:00:02.002Z'),
          },
        },
      ]

      test.each(cases)('email: $params.email', async ({ params, expected }) => {
        const resolver = SignInMutationResolver.create()

        const actual = await resolver.findPasswordHashByEmail(params)

        expect(actual)
          .toHaveProperty(
            'dataValues',
            expect.objectContaining(expected)
          )
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
        const resolver = SignInMutationResolver.create()

        const actual = await resolver.findPasswordHashByEmail(params)

        expect(actual)
          .toBeNull()
      })
    })
  })
})

describe('SignInMutationResolver', () => {
  describe('#formatResponse()', () => {
    describe('from the credential pair', () => {
      const cases = [
        {
          params: {
            credentialPair: {
              accessToken: 'accessToken.100001',
              refreshToken: 'refreshToken.100001',
              sessionKey: 'sessionKey.100001',
            },
          },
          expected: {
            accessToken: 'accessToken.100001',
          },
        },
        {
          params: {
            credentialPair: {
              accessToken: 'accessToken.100002',
              refreshToken: 'refreshToken.100002',
              sessionKey: 'sessionKey.100002',
            },
          },
          expected: {
            accessToken: 'accessToken.100002',
          },
        },
      ]

      test.each(cases)('accessToken: $params.credentialPair.accessToken', ({ params, expected }) => {
        const resolver = SignInMutationResolver.create()

        const actual = resolver.formatResponse(params)

        expect(actual)
          .toEqual(expected)
      })
    })

    describe('should keep the refresh token out of the body', () => {
      // The refresh token reaches the admin browser only as a cookie under the admin name and path.
      const cases = [
        {
          params: {
            credentialPair: {
              accessToken: 'accessToken.100001',
              refreshToken: 'refreshToken.100001',
              sessionKey: 'sessionKey.100001',
            },
          },
        },
        {
          params: {
            credentialPair: {
              accessToken: 'accessToken.100002',
              refreshToken: 'refreshToken.100002',
              sessionKey: 'sessionKey.100002',
            },
          },
        },
      ]

      test.each(cases)('refreshToken: $params.credentialPair.refreshToken', ({ params }) => {
        const resolver = SignInMutationResolver.create()

        const actual = resolver.formatResponse(params)

        expect(JSON.stringify(actual))
          .not
          .toContain(params.credentialPair.refreshToken)
        expect(JSON.stringify(actual))
          .not
          .toContain(params.credentialPair.sessionKey)
      })
    })
  })
})
