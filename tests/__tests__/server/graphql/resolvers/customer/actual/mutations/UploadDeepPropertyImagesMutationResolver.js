import UploadDeepPropertyImagesMutationResolver from '../../../../../../../../server/graphql/resolvers/customer/actual/mutations/UploadDeepPropertyImagesMutationResolver.js'

describe('UploadDeepPropertyImagesMutationResolver', () => {
  describe('.schema', () => {
    test('to be fixed value', () => {
      const expected = 'uploadDeepPropertyImages'

      const actual = UploadDeepPropertyImagesMutationResolver.schema

      expect(actual)
        .toBe(expected)
    })
  })
})
