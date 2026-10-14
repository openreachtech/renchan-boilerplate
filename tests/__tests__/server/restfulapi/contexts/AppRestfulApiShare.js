import {
  BaseRestfulApiShare,
} from '@openreachtech/renchan'

import AppRestfulApiShare from '../../../../../server/restfulapi/contexts/AppRestfulApiShare.js'

import AllowedCorsOriginCollection from '../../../../../server/tools/AllowedCorsOriginCollection.js'

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
  describe('constructor', () => {
    describe('should keep property', () => {
      describe('#allowedCorsOriginCollection', () => {
        const cases = [
          {
            input: {
              allowedCorsOriginCollection: AllowedCorsOriginCollection.create({
                originsString: 'https://alpha.example',
              }),
            },
          },
          {
            input: {
              allowedCorsOriginCollection: AllowedCorsOriginCollection.create({
                originsString: null,
              }),
            },
          },
        ]

        test.each(cases)('originsString: $input.allowedCorsOriginCollection.originsString', ({ input }) => {
          const args = {
            env: /** @type {*} */ ({}),
            allowedCorsOriginCollection: input.allowedCorsOriginCollection,
          }

          const share = new AppRestfulApiShare(args)

          expect(share)
            .toHaveProperty('allowedCorsOriginCollection', input.allowedCorsOriginCollection)
        })
      })
    })
  })
})

describe('AppRestfulApiShare', () => {
  describe('.create()', () => {
    describe('should fill default allowedCorsOriginCollection', () => {
      test('with no allowedCorsOriginCollection', () => {
        const share = AppRestfulApiShare.create({})

        expect(share.allowedCorsOriginCollection)
          .toBeInstanceOf(AllowedCorsOriginCollection)
        expect(share.allowedCorsOriginCollection.extractOrigins())
          .toEqual([])
      })
    })
  })
})

describe('AppRestfulApiShare', () => {
  describe('.createAsync()', () => {
    describe('to keep the origins CORS_RESTFUL_API_ORIGINS declares', () => {
      const cases = [
        {
          input: {
            originsString: 'https://alpha.example',
          },
          expected: [
            'https://alpha.example',
          ],
        },
        {
          input: {
            originsString: 'https://alpha.example, https://beta.example',
          },
          expected: [
            'https://alpha.example',
            'https://beta.example',
          ],
        },
      ]

      test.each(cases)('originsString: $input.originsString', async ({ input, expected }) => {
        jest.spyOn(AppRestfulApiShare, 'generateEnv')
          .mockReturnValueOnce(/** @type {*} */ ({
            CORS_RESTFUL_API_ORIGINS: input.originsString,
          }))

        const share = await AppRestfulApiShare.createAsync({
          config: /** @type {*} */ ({}),
        })

        const actual = share.allowedCorsOriginCollection.extractOrigins()

        expect(actual)
          .toEqual(expected)
      })
    })

    describe('to keep no origins when CORS_RESTFUL_API_ORIGINS declares none', () => {
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

      test.each(cases)('env: $input.env', async ({ input }) => {
        jest.spyOn(AppRestfulApiShare, 'generateEnv')
          .mockReturnValueOnce(/** @type {*} */ (input.env))

        const share = await AppRestfulApiShare.createAsync({
          config: /** @type {*} */ ({}),
        })

        const actual = share.allowedCorsOriginCollection.extractOrigins()

        expect(actual)
          .toEqual([])
      })
    })
  })
})

describe('AppRestfulApiShare', () => {
  describe('.createAllowedCorsOriginCollection()', () => {
    describe('to be instance of AllowedCorsOriginCollection', () => {
      const cases = [
        {
          input: {
            env: {
              CORS_RESTFUL_API_ORIGINS: 'https://alpha.example',
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
        const actual = AppRestfulApiShare.createAllowedCorsOriginCollection({
          env: /** @type {*} */ (input.env),
        })

        expect(actual)
          .toBeInstanceOf(AllowedCorsOriginCollection)
      })
    })

    describe('to keep the value of CORS_RESTFUL_API_ORIGINS', () => {
      const cases = [
        {
          input: {
            env: {
              CORS_RESTFUL_API_ORIGINS: 'https://alpha.example',
            },
          },
          expected: 'https://alpha.example',
        },
        {
          input: {
            env: {
              CORS_RESTFUL_API_ORIGINS: 'https://alpha.example,https://beta.example',
            },
          },
          expected: 'https://alpha.example,https://beta.example',
        },
        {
          input: {
            env: {
              CORS_RESTFUL_API_ORIGINS: '',
            },
          },
          expected: '',
        },
      ]

      test.each(cases)('env: $input.env', ({ input, expected }) => {
        const actual = AppRestfulApiShare.createAllowedCorsOriginCollection({
          env: /** @type {*} */ (input.env),
        })

        expect(actual)
          .toHaveProperty('originsString', expected)
      })
    })
  })
})
