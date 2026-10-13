import {
  BaseGraphqlShare,
} from '@openreachtech/renchan'

import CustomerGraphqlShare from '../../../../../server/graphql/contexts/CustomerGraphqlShare.js'

describe('CustomerGraphqlShare', () => {
  describe('super class', () => {
    test('to be defined from BaseGraphqlShare', () => {
      const actual = CustomerGraphqlShare.prototype

      expect(actual)
        .toBeInstanceOf(BaseGraphqlShare)
    })
  })
})

describe('CustomerGraphqlShare', () => {
  describe('#generateAllowedOrigins()', () => {
    describe('to generate the origins CORS_CUSTOMER_ORIGINS declares', () => {
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
        const share = CustomerGraphqlShare.create({
          env: /** @type {*} */ ({
            CORS_CUSTOMER_ORIGINS: input.originsText,
          }),
        })

        const actual = share.generateAllowedOrigins()

        expect(actual)
          .toEqual(expected)
      })
    })

    describe('to generate no origins when CORS_CUSTOMER_ORIGINS declares none', () => {
      const cases = [
        {
          input: {
            env: {
              CORS_CUSTOMER_ORIGINS: '',
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
        const share = CustomerGraphqlShare.create({
          env: /** @type {*} */ (input.env),
        })

        const actual = share.generateAllowedOrigins()

        expect(actual)
          .toEqual([])
      })
    })
  })
})
