import InvalidInputSignUpGraphqlError from '../../../../../server/graphql/errors/InvalidInputSignUpGraphqlError.js'

describe('InvalidInputSignUpGraphqlError', () => {
  describe('.get:errorCode', () => {
    test('to be fixed value', () => {
      const expected = '22.01.01'

      const actual = InvalidInputSignUpGraphqlError.errorCode

      expect(actual)
        .toBe(expected)
    })
  })
})

describe('InvalidInputSignUpGraphqlError', () => {
  describe('#get:errorMessage', () => {
    test('to be fixed value', () => {
      const expected = 'Invalid input.'

      const actual = InvalidInputSignUpGraphqlError.errorMessage

      expect(actual)
        .toBe(expected)
    })
  })
})
