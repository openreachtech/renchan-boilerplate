import UploadArrayImagesMutationResolver from '../../../../../../../../server/graphql/resolvers/customer/actual/mutations/UploadArrayImagesMutationResolver.js'

describe('UploadArrayImagesMutationResolver', () => {
  describe('.schema', () => {
    test('to be fixed value', () => {
      const expected = 'uploadArrayImages'

      const actual = UploadArrayImagesMutationResolver.schema

      expect(actual)
        .toBe(expected)
    })
  })
})
