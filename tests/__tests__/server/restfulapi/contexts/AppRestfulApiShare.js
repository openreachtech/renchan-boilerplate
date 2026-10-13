import {
  BaseRestfulApiShare,
} from '@openreachtech/renchan'

import AppRestfulApiShare from '../../../../../server/restfulapi/contexts/AppRestfulApiShare.js'

describe('AppRestfulApiShare', () => {
  describe('super class', () => {
    test('to be defined from BaseRestfulApiShare', () => {
      const actual = AppRestfulApiShare.prototype

      expect(actual)
        .toBeInstanceOf(BaseRestfulApiShare)
    })
  })
})

describe('AppRestfulApiShare', () => {
  describe('#generateAllowedOrigins()', () => {
    describe('to generate the origins CORS_RESTFUL_API_ORIGINS declares', () => {
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
        const share = AppRestfulApiShare.create({
          env: /** @type {*} */ ({
            CORS_RESTFUL_API_ORIGINS: input.originsText,
          }),
        })

        const actual = share.generateAllowedOrigins()

        expect(actual)
          .toEqual(expected)
      })
    })

    describe('to generate no origins when CORS_RESTFUL_API_ORIGINS declares none', () => {
      const cases = [
        {
          input: {
            env: {
              CORS_RESTFUL_API_ORIGINS: '',
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
        const share = AppRestfulApiShare.create({
          env: /** @type {*} */ (input.env),
        })

        const actual = share.generateAllowedOrigins()

        expect(actual)
          .toEqual([])
      })
    })
  })
})
