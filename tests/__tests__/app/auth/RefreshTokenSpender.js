import RefreshTokenSpender from '../../../../app/auth/RefreshTokenSpender.js'

describe('RefreshTokenSpender', () => {
  describe('constructor', () => {
    describe('should keep property', () => {
      describe('#RefreshTokenModel', () => {
        const cases = [
          {
            input: {
              RefreshTokenModel: /** @type {*} */ ({
                tableName: 'refresh_tokens_0001',
              }),
            },
          },
          {
            input: {
              RefreshTokenModel: /** @type {*} */ ({
                tableName: 'refresh_tokens_0002',
              }),
            },
          },
        ]

        test.each(cases)('RefreshTokenModel: $input.RefreshTokenModel.tableName', ({ input }) => {
          const args = {
            RefreshTokenModel: input.RefreshTokenModel,
          }

          const spender = new RefreshTokenSpender(args)

          expect(spender)
            .toHaveProperty('RefreshTokenModel', input.RefreshTokenModel)
        })
      })
    })
  })
})

describe('RefreshTokenSpender', () => {
  describe('.create()', () => {
    describe('should be an instance of own class', () => {
      const cases = [
        {
          input: {
            RefreshTokenModel: /** @type {*} */ ({
              tableName: 'refresh_tokens_0001',
            }),
          },
        },
        {
          input: {
            RefreshTokenModel: /** @type {*} */ ({
              tableName: 'refresh_tokens_0002',
            }),
          },
        },
      ]

      test.each(cases)('RefreshTokenModel: $input.RefreshTokenModel.tableName', ({ input }) => {
        const received = RefreshTokenSpender.create(input)

        expect(received)
          .toBeInstanceOf(RefreshTokenSpender)
      })
    })

    describe('should call constructor', () => {
      const cases = [
        {
          input: {
            RefreshTokenModel: /** @type {*} */ ({
              tableName: 'refresh_tokens_0001',
            }),
          },
        },
        {
          input: {
            RefreshTokenModel: /** @type {*} */ ({
              tableName: 'refresh_tokens_0002',
            }),
          },
        },
      ]

      test.each(cases)('RefreshTokenModel: $input.RefreshTokenModel.tableName', ({ input }) => {
        const SpyClass = globalThis.constructorSpy.spyOn(RefreshTokenSpender)

        SpyClass.create(input)

        expect(SpyClass.__spy__)
          .toHaveBeenCalledWith(input)
      })
    })
  })
})
