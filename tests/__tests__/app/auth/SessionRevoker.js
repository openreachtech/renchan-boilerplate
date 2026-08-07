import SessionRevoker from '../../../../app/auth/SessionRevoker.js'

describe('SessionRevoker', () => {
  describe('constructor', () => {
    describe('should keep property', () => {
      describe('#AccessTokenModel', () => {
        const cases = [
          {
            input: {
              AccessTokenModel: /** @type {*} */ ({
                tableName: 'access_tokens_0001',
              }),
            },
          },
          {
            input: {
              AccessTokenModel: /** @type {*} */ ({
                tableName: 'access_tokens_0002',
              }),
            },
          },
        ]

        test.each(cases)('AccessTokenModel: $input.AccessTokenModel.tableName', ({ input }) => {
          const args = {
            AccessTokenModel: input.AccessTokenModel,
            RefreshTokenModel: /** @type {*} */ ({}),
          }

          const revoker = new SessionRevoker(args)

          expect(revoker)
            .toHaveProperty('AccessTokenModel', input.AccessTokenModel)
        })
      })

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
            AccessTokenModel: /** @type {*} */ ({}),
            RefreshTokenModel: input.RefreshTokenModel,
          }

          const revoker = new SessionRevoker(args)

          expect(revoker)
            .toHaveProperty('RefreshTokenModel', input.RefreshTokenModel)
        })
      })
    })
  })
})

describe('SessionRevoker', () => {
  describe('.create()', () => {
    describe('should be an instance of own class', () => {
      const cases = [
        {
          input: {
            AccessTokenModel: /** @type {*} */ ({
              tableName: 'access_tokens_0001',
            }),
            RefreshTokenModel: /** @type {*} */ ({
              tableName: 'refresh_tokens_0001',
            }),
          },
        },
        {
          input: {
            AccessTokenModel: /** @type {*} */ ({
              tableName: 'access_tokens_0002',
            }),
            RefreshTokenModel: /** @type {*} */ ({
              tableName: 'refresh_tokens_0002',
            }),
          },
        },
      ]

      test.each(cases)('AccessTokenModel: $input.AccessTokenModel.tableName', ({ input }) => {
        const received = SessionRevoker.create(input)

        expect(received)
          .toBeInstanceOf(SessionRevoker)
      })
    })

    describe('should call constructor', () => {
      const cases = [
        {
          input: {
            AccessTokenModel: /** @type {*} */ ({
              tableName: 'access_tokens_0001',
            }),
            RefreshTokenModel: /** @type {*} */ ({
              tableName: 'refresh_tokens_0001',
            }),
          },
        },
        {
          input: {
            AccessTokenModel: /** @type {*} */ ({
              tableName: 'access_tokens_0002',
            }),
            RefreshTokenModel: /** @type {*} */ ({
              tableName: 'refresh_tokens_0002',
            }),
          },
        },
      ]

      test.each(cases)('AccessTokenModel: $input.AccessTokenModel.tableName', ({ input }) => {
        const SpyClass = globalThis.constructorSpy.spyOn(SessionRevoker)

        SpyClass.create(input)

        expect(SpyClass.__spy__)
          .toHaveBeenCalledWith(input)
      })
    })
  })
})
