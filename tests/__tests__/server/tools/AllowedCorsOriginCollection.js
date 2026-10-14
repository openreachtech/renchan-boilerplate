import AllowedCorsOriginCollection from '../../../../server/tools/AllowedCorsOriginCollection.js'

describe('AllowedCorsOriginCollection', () => {
  describe('constructor', () => {
    describe('to keep properties', () => {
      describe('#originsString', () => {
        const cases = [
          {
            input: {
              originsString: 'https://alpha.example',
            },
          },
          {
            input: {
              originsString: null,
            },
          },
        ]

        test.each(cases)('originsString: $input.originsString', ({ input }) => {
          const collection = new AllowedCorsOriginCollection(input)

          expect(collection)
            .toHaveProperty('originsString', input.originsString)
        })
      })
    })
  })
})

describe('AllowedCorsOriginCollection', () => {
  describe('.create()', () => {
    describe('should be instance of own class', () => {
      const cases = [
        {
          input: {
            originsString: 'https://alpha.example',
          },
        },
        {
          input: {
            originsString: null,
          },
        },
      ]

      test.each(cases)('originsString: $input.originsString', ({ input }) => {
        const actual = AllowedCorsOriginCollection.create(input)

        expect(actual)
          .toBeInstanceOf(AllowedCorsOriginCollection)
      })
    })

    describe('should be called by constructor', () => {
      const cases = [
        {
          input: {
            originsString: 'https://alpha.example',
          },
        },
        {
          input: {
            originsString: null,
          },
        },
      ]

      test.each(cases)('originsString: $input.originsString', ({ input }) => {
        const SpyClass = globalThis.constructorSpy.spyOn(AllowedCorsOriginCollection)

        SpyClass.create(input)

        expect(SpyClass.__spy__)
          .toHaveBeenCalledWith(input)
      })
    })
  })
})

describe('AllowedCorsOriginCollection', () => {
  describe('#extractOrigins()', () => {
    describe('to split the declared origins', () => {
      const cases = [
        {
          input: {
            originsString: 'https://alpha.example',
          },
          expected: [
            'https://alpha.example',
          ],
        },
        {
          input: {
            originsString: 'https://alpha.example,https://beta.example',
          },
          expected: [
            'https://alpha.example',
            'https://beta.example',
          ],
        },
        {
          input: {
            originsString: ' https://alpha.example , https://beta.example ',
          },
          expected: [
            'https://alpha.example',
            'https://beta.example',
          ],
        },
        {
          input: {
            originsString: 'https://alpha.example,,https://beta.example,',
          },
          expected: [
            'https://alpha.example',
            'https://beta.example',
          ],
        },
      ]

      test.each(cases)('originsString: $input.originsString', ({ input, expected }) => {
        const collection = AllowedCorsOriginCollection.create(input)

        const actual = collection.extractOrigins()

        expect(actual)
          .toEqual(expected)
      })
    })

    describe('to allow no origin when nothing is declared', () => {
      const cases = [
        {
          input: {
            originsString: null,
          },
        },
        {
          input: {
            originsString: undefined,
          },
        },
        {
          input: {
            originsString: '',
          },
        },
        {
          input: {
            originsString: ' , ',
          },
        },
      ]

      test.each(cases)('originsString: $input.originsString', ({ input }) => {
        const collection = AllowedCorsOriginCollection.create(input)

        const actual = collection.extractOrigins()

        expect(actual)
          .toEqual([])
      })
    })
  })
})
