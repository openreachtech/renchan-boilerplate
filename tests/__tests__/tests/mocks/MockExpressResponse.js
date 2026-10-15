import MockExpressResponse from '../../../mocks/MockExpressResponse.js'

describe('MockExpressResponse', () => {
  describe('.create()', () => {
    test('should be an instance of own class', () => {
      const received = MockExpressResponse.create()

      expect(received)
        .toBeInstanceOf(MockExpressResponse)
    })
  })
})

describe('MockExpressResponse', () => {
  describe('#getHeader()', () => {
    describe('should answer the header it holds', () => {
      const cases = [
        {
          input: {
            headerHash: {
              Vary: 'Origin',
            },
            name: 'Vary',
          },
          expected: 'Origin',
        },
        {
          input: {
            headerHash: {},
            name: 'Vary',
          },
          expected: undefined,
        },
      ]

      test.each(cases)('name: $input.name', ({ input, expected }) => {
        const mockResponse = MockExpressResponse.create({
          headerHash: input.headerHash,
        })

        const received = mockResponse.getHeader(input.name)

        expect(received)
          .toBe(expected)
      })
    })
  })
})

describe('MockExpressResponse', () => {
  describe('#setHeader()', () => {
    describe('should hold the header it is given', () => {
      const cases = [
        {
          input: {
            name: 'Vary',
            value: 'Origin',
          },
        },
        {
          input: {
            name: 'Access-Control-Allow-Origin',
            value: 'https://alpha.example',
          },
        },
      ]

      test.each(cases)('name: $input.name', ({ input }) => {
        const mockResponse = MockExpressResponse.create()

        mockResponse.setHeader(input.name, input.value)

        expect(mockResponse.getHeader(input.name))
          .toBe(input.value)
      })
    })
  })
})
