import SignInMutationResolver from '../../../../../../../../server/graphql/resolvers/customer/actual/mutations/SignInMutationResolver.js'

import SessionClerk from '../../../../../../../../app/session/SessionClerk.js'
import SavingSessionResult from '../../../../../../../../app/session/SavingSessionResult.js'
import RefreshTokenExpressCookieClerk from '../../../../../../../../server/graphql/contexts/tools/RefreshTokenExpressCookieClerk.js'

describe('SignInMutationResolver', () => {
  describe('#resolve()', () => {
    const resolver = SignInMutationResolver.create()

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
            accessToken: expect.stringMatching(/^[a-zA-Z0-9]{10}$/u),
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
            accessToken: expect.stringMatching(/^[a-zA-Z0-9]{10}$/u),
          },
        },
      ]

      test.each(cases)('email: $input.variables.input.email', async ({
        input,
        expected,
      }) => {
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

        await resolver.resolve(input)

        expect(saveRefreshTokenCookieSpy)
          .toHaveBeenCalledWith(expected)
      })
    })

    describe('should reject when saving the session fails', () => {
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
              now: new Date('2026-08-09T00:00:09.009Z'),
            }),
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
              now: new Date('2026-08-10T00:00:10.010Z'),
            }),
          },
        },
      ]

      test.each(cases)('email: $input.variables.input.email', async ({ input }) => {
        jest.spyOn(SessionClerk.prototype, 'saveSession')
          .mockResolvedValue(SavingSessionResult.create({
            error: new Error('Failed to save the session token pair'),
          }))

        const actual = () => resolver.resolve(input)

        await expect(actual)
          .rejects
          .toThrow('Failed to save the session token pair')
      })
    })
  })
})
