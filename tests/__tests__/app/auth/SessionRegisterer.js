import SessionRegisterer from '../../../../app/auth/SessionRegisterer.js'
import SessionCredentialClerk from '../../../../app/auth/SessionCredentialClerk.js'

import CustomerAccessToken from '../../../../sequelize/models/CustomerAccessToken.js'
import CustomerRefreshToken from '../../../../sequelize/models/CustomerRefreshToken.js'

describe('SessionRegisterer', () => {
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
            credentialClerk: /** @type {*} */ ({}),
          }

          const registerer = new SessionRegisterer(args)

          expect(registerer)
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
            credentialClerk: /** @type {*} */ ({}),
          }

          const registerer = new SessionRegisterer(args)

          expect(registerer)
            .toHaveProperty('RefreshTokenModel', input.RefreshTokenModel)
        })
      })

      describe('#credentialClerk', () => {
        const cases = [
          {
            input: {
              credentialClerk: /** @type {*} */ ({
                tokenByteSize: 101,
              }),
            },
          },
          {
            input: {
              credentialClerk: /** @type {*} */ ({
                tokenByteSize: 202,
              }),
            },
          },
        ]

        test.each(cases)('credentialClerk: $input.credentialClerk.tokenByteSize', ({ input }) => {
          const args = {
            AccessTokenModel: /** @type {*} */ ({}),
            RefreshTokenModel: /** @type {*} */ ({}),
            credentialClerk: input.credentialClerk,
          }

          const registerer = new SessionRegisterer(args)

          expect(registerer)
            .toHaveProperty('credentialClerk', input.credentialClerk)
        })
      })
    })
  })
})

describe('SessionRegisterer', () => {
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
            credentialClerk: /** @type {*} */ ({
              tokenByteSize: 101,
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
            credentialClerk: /** @type {*} */ ({
              tokenByteSize: 202,
            }),
          },
        },
      ]

      test.each(cases)('AccessTokenModel: $input.AccessTokenModel.tableName', ({ input }) => {
        const received = SessionRegisterer.create(input)

        expect(received)
          .toBeInstanceOf(SessionRegisterer)
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
            credentialClerk: /** @type {*} */ ({
              tokenByteSize: 101,
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
            credentialClerk: /** @type {*} */ ({
              tokenByteSize: 202,
            }),
          },
        },
      ]

      test.each(cases)('AccessTokenModel: $input.AccessTokenModel.tableName', ({ input }) => {
        const SpyClass = globalThis.constructorSpy.spyOn(SessionRegisterer)

        SpyClass.create(input)

        expect(SpyClass.__spy__)
          .toHaveBeenCalledWith(input)
      })
    })

    describe('should fill default credentialClerk', () => {
      test('with no credential clerk', () => {
        const credentialClerk = SessionCredentialClerk.create()
        const expected = {
          AccessTokenModel: /** @type {*} */ ({
            tableName: 'access_tokens_0003',
          }),
          RefreshTokenModel: /** @type {*} */ ({
            tableName: 'refresh_tokens_0003',
          }),
          credentialClerk,
        }
        const input = {
          AccessTokenModel: expected.AccessTokenModel,
          RefreshTokenModel: expected.RefreshTokenModel,
          // credentialClerk: omitted, so it falls back to the default
        }

        jest.spyOn(SessionRegisterer, 'createCredentialClerk')
          .mockReturnValue(credentialClerk)
        const SpyClass = globalThis.constructorSpy.spyOn(SessionRegisterer)

        SpyClass.create(input)

        expect(SpyClass.__spy__)
          .toHaveBeenCalledWith(expected)
      })
    })
  })
})

describe('SessionRegisterer', () => {
  describe('.get:SessionCredentialClerkCtor', () => {
    test('should be the SessionCredentialClerk class', () => {
      const received = SessionRegisterer.SessionCredentialClerkCtor

      expect(received)
        .toBe(SessionCredentialClerk) // same reference
    })
  })
})

describe('SessionRegisterer', () => {
  describe('.createCredentialClerk()', () => {
    test('should be a session credential clerk', () => {
      const received = SessionRegisterer.createCredentialClerk()

      expect(received)
        .toBeInstanceOf(SessionCredentialClerk)
    })
  })
})

describe('SessionRegisterer', () => {
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
        const registerer = SessionRegisterer.create({
          AccessTokenModel: CustomerAccessToken,
          RefreshTokenModel: CustomerRefreshToken,
        })

        const received = await registerer.findRefreshTokenEntity(input)

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
        const registerer = SessionRegisterer.create({
          AccessTokenModel: CustomerAccessToken,
          RefreshTokenModel: CustomerRefreshToken,
        })

        const received = await registerer.findRefreshTokenEntity(input)

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

        const registerer = SessionRegisterer.create({
          AccessTokenModel: CustomerAccessToken,
          RefreshTokenModel: CustomerRefreshToken,
        })

        const received = await registerer.findRefreshTokenEntity(input)

        expect(received)
          .toBeNull()
        expect(findOneSpy)
          .not
          .toHaveBeenCalled()
      })
    })
  })
})
