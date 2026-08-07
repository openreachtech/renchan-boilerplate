import RefreshTokenSpender from '../../../../app/auth/RefreshTokenSpender.js'

import CustomerRefreshToken from '../../../../sequelize/models/CustomerRefreshToken.js'

describe('RefreshTokenSpender', () => {
  describe('#spendRefreshToken()', () => {
    describe('should mark the given refresh token used', () => {
      const cases = [
        {
          input: {
            customerId: 952001,
            sessionKey: 'clerk-session-key-952001',
            refreshToken: 'spend-refresh-token-952001',
            generatedAt: new Date('2026-08-07T00:00:07.007Z'),
            now: new Date('2026-08-07T06:00:07.007Z'),
          },
          expected: [1],
        },
        {
          input: {
            customerId: 952002,
            sessionKey: 'clerk-session-key-952002',
            refreshToken: 'spend-refresh-token-952002',
            generatedAt: new Date('2026-08-08T00:00:08.008Z'),
            now: new Date('2026-08-08T06:00:08.008Z'),
          },
          expected: [1],
        },
      ]

      test.each(cases)('sessionKey: $input.sessionKey', async ({
        input,
        expected,
      }) => {
        const refreshTokenEntity = CustomerRefreshToken.buildWithGeneratedAttributes({
          customerId: input.customerId,
          sessionKey: input.sessionKey,
          refreshToken: input.refreshToken,
          generatedAt: input.generatedAt,
        })
        await refreshTokenEntity.save()
        const spender = RefreshTokenSpender.create({
          RefreshTokenModel: CustomerRefreshToken,
        })
        const args = {
          refreshTokenEntity,
          now: input.now,
          transaction: null,
        }

        const received = await spender.spendRefreshToken(args)

        expect(received)
          .toEqual(expected)
      })
    })
  })
})
