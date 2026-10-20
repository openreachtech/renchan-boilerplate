import MockExpressRequest from '../../../mocks/MockExpressRequest.js'

describe('MockExpressRequest', () => {
  describe('.create()', () => {
    describe('should keep the method and the origin header', () => {
      const cases = [
        {
          input: {
            method: 'GET',
            origin: 'https://alpha.example',
          },
          expected: {
            method: 'GET',
            headers: {
              origin: 'https://alpha.example',
            },
          },
        },
        {
          input: {
            method: 'OPTIONS',
            origin: 'http://localhost:3000',
          },
          expected: {
            method: 'OPTIONS',
            headers: {
              origin: 'http://localhost:3000',
            },
          },
        },
      ]

      test.each(cases)('method: $input.method, origin: $input.origin', ({ input, expected }) => {
        const received = MockExpressRequest.create(input)

        expect(received)
          .toBeInstanceOf(MockExpressRequest)
        expect(received)
          .toMatchObject(expected)
      })
    })
  })
})
