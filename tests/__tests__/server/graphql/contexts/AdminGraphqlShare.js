import {
  BaseGraphqlShare,
} from '@openreachtech/renchan'

import AdminGraphqlShare from '../../../../../server/graphql/contexts/AdminGraphqlShare.js'

describe('AdminGraphqlShare', () => {
  describe('super class', () => {
    test('to be defined from BaseGraphqlShare', () => {
      const actual = AdminGraphqlShare.prototype

      expect(actual)
        .toBeInstanceOf(BaseGraphqlShare)
    })
  })
})

describe('AdminGraphqlShare', () => {
  describe('#generateAllowedOrigins()', () => {
    describe('to generate the origins CORS_ADMIN_ORIGINS declares', () => {
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
            originsText: 'https://alpha.example, https://beta.example',
          },
          expected: [
            'https://alpha.example',
            'https://beta.example',
          ],
        },
      ]

      test.each(cases)('originsText: $input.originsText', ({ input, expected }) => {
        const share = AdminGraphqlShare.create({
          env: /** @type {*} */ ({
            CORS_ADMIN_ORIGINS: input.originsText,
          }),
        })

        const actual = share.generateAllowedOrigins()

        expect(actual)
          .toEqual(expected)
      })
    })

    describe('to generate no origins when CORS_ADMIN_ORIGINS declares none', () => {
      const cases = [
        {
          input: {
            env: {
              CORS_ADMIN_ORIGINS: '',
            },
          },
        },
        {
          input: {
            env: {},
          },
        },
      ]

      test.each(cases)('env: $input.env', ({ input }) => {
        const share = AdminGraphqlShare.create({
          env: /** @type {*} */ (input.env),
        })

        const actual = share.generateAllowedOrigins()

        expect(actual)
          .toEqual([])
      })
    })
  })
})
