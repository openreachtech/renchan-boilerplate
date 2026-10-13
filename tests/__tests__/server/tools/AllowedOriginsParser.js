import AllowedOriginsParser from '../../../../server/tools/AllowedOriginsParser.js'

describe('AllowedOriginsParser', () => {
  describe('constructor', () => {
    describe('to keep properties', () => {
      describe('#originsText', () => {
        const cases = [
          {
            input: {
              originsText: 'https://alpha.example',
            },
          },
          {
            input: {
              originsText: null,
            },
          },
        ]

        test.each(cases)('originsText: $input.originsText', ({ input }) => {
          const parser = new AllowedOriginsParser(input)

          expect(parser)
            .toHaveProperty('originsText', input.originsText)
        })
      })
    })
  })
})

describe('AllowedOriginsParser', () => {
  describe('.create()', () => {
    describe('should be instance of own class', () => {
      const cases = [
        {
          input: {
            originsText: 'https://alpha.example',
          },
        },
        {
          input: {
            originsText: null,
          },
        },
      ]

      test.each(cases)('originsText: $input.originsText', ({ input }) => {
        const actual = AllowedOriginsParser.create(input)

        expect(actual)
          .toBeInstanceOf(AllowedOriginsParser)
      })
    })

    describe('should be called by constructor', () => {
      const cases = [
        {
          input: {
            originsText: 'https://alpha.example',
          },
        },
        {
          input: {
            originsText: null,
          },
        },
      ]

      test.each(cases)('originsText: $input.originsText', ({ input }) => {
        const SpyClass = globalThis.constructorSpy.spyOn(AllowedOriginsParser)

        SpyClass.create(input)

        expect(SpyClass.__spy__)
          .toHaveBeenCalledWith(input)
      })
    })
  })
})

describe('AllowedOriginsParser', () => {
  describe('#parseOrigins()', () => {
    describe('to split the declared origins', () => {
      const cases = [
        {
          input: {
            originsText: 'https://alpha.example',
          },
          expected: [
            'https://alpha.example',
          ],
        },
        {
          input: {
            originsText: 'https://alpha.example,https://beta.example',
          },
          expected: [
            'https://alpha.example',
            'https://beta.example',
          ],
        },
        {
          input: {
            originsText: ' https://alpha.example , https://beta.example ',
          },
          expected: [
            'https://alpha.example',
            'https://beta.example',
          ],
        },
        {
          input: {
            originsText: 'https://alpha.example,,https://beta.example,',
          },
          expected: [
            'https://alpha.example',
            'https://beta.example',
          ],
        },
      ]

      test.each(cases)('originsText: $input.originsText', ({ input, expected }) => {
        const parser = AllowedOriginsParser.create(input)

        const actual = parser.parseOrigins()

        expect(actual)
          .toEqual(expected)
      })
    })

    describe('to allow no origin when nothing is declared', () => {
      const cases = [
        {
          input: {
            originsText: null,
          },
        },
        {
          input: {
            originsText: undefined,
          },
        },
        {
          input: {
            originsText: '',
          },
        },
        {
          input: {
            originsText: ' , ',
          },
        },
      ]

      test.each(cases)('originsText: $input.originsText', ({ input }) => {
        const parser = AllowedOriginsParser.create(input)

        const actual = parser.parseOrigins()

        expect(actual)
          .toEqual([])
      })
    })
  })
})
