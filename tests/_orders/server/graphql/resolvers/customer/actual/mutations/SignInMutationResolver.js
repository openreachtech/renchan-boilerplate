import SignInMutationResolver from '../../../../../../../../server/graphql/resolvers/customer/actual/mutations/SignInMutationResolver.js'

import RefreshTokenExpressCookieClerk from '../../../../../../../../server/graphql/contexts/tools/RefreshTokenExpressCookieClerk.js'

import CustomerAccessToken from '../../../../../../../../sequelize/models/CustomerAccessToken.js'
import CustomerRefreshToken from '../../../../../../../../sequelize/models/CustomerRefreshToken.js'

describe('SignInMutationResolver', () => {
  describe('#generateTransactionCallback()', () => {
    describe('the callback issues a token pair', () => {
      const cases = [
        {
          input: {
            customerId: 920001,
            now: new Date('2026-08-01T00:00:01.001Z'),
          },
          expected: {
            accessTokenEntity: expect.any(CustomerAccessToken),
            refreshTokenEntity: expect.any(CustomerRefreshToken),
            refreshToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
          },
        },
        {
          input: {
            customerId: 920002,
            now: new Date('2026-08-02T00:00:02.002Z'),
          },
          expected: {
            accessTokenEntity: expect.any(CustomerAccessToken),
            refreshTokenEntity: expect.any(CustomerRefreshToken),
            refreshToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
          },
        },
      ]

      test.each(cases)('customerId: $input.customerId', async ({
        input,
        expected,
      }) => {
        const resolver = SignInMutationResolver.create()
        const args = {
          customerId: input.customerId,
          now: input.now,
        }

        const received = await CustomerAccessToken.beginTransaction(
          resolver.generateTransactionCallback(args)
        )

        expect(received)
          .toEqual(expected)
      })
    })
  })
})

describe('SignInMutationResolver', () => {
  describe('#saveSession()', () => {
    describe('should issue a token pair', () => {
      const cases = [
        {
          input: {
            customerId: 921001,
            now: new Date('2026-08-03T00:00:03.003Z'),
          },
          expected: {
            accessTokenEntity: expect.any(CustomerAccessToken),
            refreshTokenEntity: expect.any(CustomerRefreshToken),
            refreshToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
          },
        },
        {
          input: {
            customerId: 921002,
            now: new Date('2026-08-04T00:00:04.004Z'),
          },
          expected: {
            accessTokenEntity: expect.any(CustomerAccessToken),
            refreshTokenEntity: expect.any(CustomerRefreshToken),
            refreshToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
          },
        },
      ]

      test.each(cases)('customerId: $input.customerId', async ({
        input,
        expected,
      }) => {
        const resolver = SignInMutationResolver.create()
        const args = {
          context: /** @type {*} */ ({
            now: input.now,
          }),
          customerId: input.customerId,
        }

        const received = await resolver.saveSession(args)

        expect(received)
          .toEqual(expected)
      })
    })
  })
})

describe('SignInMutationResolver', () => {
  describe('#resolve()', () => {
    describe('with existing email and correct password', () => {
      const cases = [
        {
          input: {
            variables: {
              input: {
                email: 'customer.100001@example.com',
                password: 'pAsswOrd$01',
              },
            },
            context: /** @type {*} */ ({
              now: new Date('2026-08-05T00:00:05.005Z'),
            }),
          },
          expected: {
            accessToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
          },
        },
        {
          input: {
            variables: {
              input: {
                email: 'customer.100002@example.com',
                password: 'pAsswOrd$02',
              },
            },
            context: /** @type {*} */ ({
              now: new Date('2026-08-06T00:00:06.006Z'),
            }),
          },
          expected: {
            accessToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
          },
        },
      ]

      test.each(cases)('email: $input.variables.input.email', async ({
        input,
        expected,
      }) => {
        const resolver = SignInMutationResolver.create()

        const received = await resolver.resolve(input)

        expect(received)
          .toEqual(expected)
      })
    })

    describe('should hand the refresh token to the browser as a cookie', () => {
      const cases = [
        {
          input: {
            variables: {
              input: {
                email: 'customer.100003@example.com',
                password: 'pAsswOrd$03',
              },
            },
            context: /** @type {*} */ ({
              now: new Date('2026-08-07T00:00:07.007Z'),
            }),
          },
          expected: {
            refreshToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
          },
        },
        {
          input: {
            variables: {
              input: {
                email: 'customer.100004@example.com',
                password: 'pAsswOrd$04',
              },
            },
            context: /** @type {*} */ ({
              now: new Date('2026-08-08T00:00:08.008Z'),
            }),
          },
          expected: {
            refreshToken: expect.stringMatching(/^[0-9a-f]{64}$/u),
          },
        },
      ]

      test.each(cases)('email: $input.variables.input.email', async ({
        input,
        expected,
      }) => {
        const saveRefreshTokenCookieSpy = jest.spyOn(RefreshTokenExpressCookieClerk.prototype, 'saveRefreshTokenCookie')

        const resolver = SignInMutationResolver.create()

        await resolver.resolve(input)

        expect(saveRefreshTokenCookieSpy)
          .toHaveBeenCalledWith(expected)
      })
    })
  })
})
