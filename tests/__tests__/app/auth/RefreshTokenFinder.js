import RefreshTokenFinder from '../../../../app/auth/RefreshTokenFinder.js'

import CustomerRefreshToken from '../../../../sequelize/models/CustomerRefreshToken.js'

describe('RefreshTokenFinder', () => {
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

          const finder = new RefreshTokenFinder(args)

          expect(finder)
            .toHaveProperty('RefreshTokenModel', input.RefreshTokenModel)
        })
      })
    })
  })
})

describe('RefreshTokenFinder', () => {
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
        const received = RefreshTokenFinder.create(input)

        expect(received)
          .toBeInstanceOf(RefreshTokenFinder)
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
        const SpyClass = globalThis.constructorSpy.spyOn(RefreshTokenFinder)

        SpyClass.create(input)

        expect(SpyClass.__spy__)
          .toHaveBeenCalledWith(input)
      })
    })
  })
})

describe('RefreshTokenFinder', () => {
  describe('#findRefreshTokenEntity()', () => {
    describe('should answer the seeded row a presented token hashes to', () => {
      const cases = [
        {
          input: {
            presentedRefreshToken: 'refresh-token-01-01', // seeded: active
          },
          expected: 'session-key-01-01',
        },
        {
          input: {
            presentedRefreshToken: 'refresh-token-02-02', // seeded: active
          },
          expected: 'session-key-02-02',
        },
      ]

      test.each(cases)('presentedRefreshToken: $input.presentedRefreshToken', async ({
        input,
        expected,
      }) => {
        const finder = RefreshTokenFinder.create({
          RefreshTokenModel: CustomerRefreshToken,
        })

        const received = await finder.findRefreshTokenEntity(input)

        expect(received)
          .toHaveProperty('sessionKey', expected)
      })
    })

    describe('should be null when the presented token matches no row', () => {
      const cases = [
        {
          input: {
            presentedRefreshToken: 'unmatched-refresh-token-value-0001',
          },
        },
        {
          input: {
            presentedRefreshToken: 'unmatched-refresh-token-value-0002',
          },
        },
      ]

      test.each(cases)('presentedRefreshToken: $input.presentedRefreshToken', async ({ input }) => {
        const finder = RefreshTokenFinder.create({
          RefreshTokenModel: CustomerRefreshToken,
        })

        const received = await finder.findRefreshTokenEntity(input)

        expect(received)
          .toBeNull()
      })
    })

    describe('should be null without querying when no token is presented', () => {
      const cases = [
        {
          input: {
            presentedRefreshToken: null,
          },
        },
        {
          input: {
            presentedRefreshToken: '',
          },
        },
      ]

      test.each(cases)('presentedRefreshToken: $input.presentedRefreshToken', async ({ input }) => {
        const findOneSpy = jest.spyOn(CustomerRefreshToken, 'findOne')

        const finder = RefreshTokenFinder.create({
          RefreshTokenModel: CustomerRefreshToken,
        })

        const received = await finder.findRefreshTokenEntity(input)

        expect(received)
          .toBeNull()
        expect(findOneSpy)
          .not
          .toHaveBeenCalled()
      })
    })
  })
})
