import IncorrectSecretSignInGraphqlError from '../../../../../server/graphql/errors/IncorrectSecretSignInGraphqlError.js'

describe('IncorrectSecretSignInGraphqlError', () => {
  describe('.get:errorCode', () => {
    test('to be fixed value', () => {
      const expected = '22.02.01'

      const actual = IncorrectSecretSignInGraphqlError.errorCode

      expect(actual)
        .toBe(expected)
    })
  })
})

describe('IncorrectSecretSignInGraphqlError', () => {
  describe('#get:errorMessage', () => {
    test('to be fixed value', () => {
      const expected = 'Incorrect email or password.'

      const actual = IncorrectSecretSignInGraphqlError.errorMessage

      expect(actual)
        .toBe(expected)
    })
  })
})
