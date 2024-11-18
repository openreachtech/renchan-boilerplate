import SignInMutationResolver from '../../../../../../../../server/graphql/resolvers/customer/actual/mutations/SignInMutationResolver.js'

describe('SignInMutationResolver', () => {
  describe('.get:schema', () => {
    test('to be fixed value', () => {
      const actual = SignInMutationResolver.schema

      expect(actual)
        .toBe('signIn')
    })
  })
})
