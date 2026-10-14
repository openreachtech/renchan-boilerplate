import {
  BaseGraphqlShare,
} from '@openreachtech/renchan'

import AdminGraphqlShare from '../../../../../server/graphql/contexts/AdminGraphqlShare.js'

import AllowedCorsOriginCollection from '../../../../../server/tools/AllowedCorsOriginCollection.js'

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
            broker: null,
            allowedCorsOriginCollection: input.allowedCorsOriginCollection,
          }

          const share = new AdminGraphqlShare(args)

          expect(share)
            .toHaveProperty('allowedCorsOriginCollection', input.allowedCorsOriginCollection)
        })
      })
    })
  })
})

describe('AdminGraphqlShare', () => {
  describe('.create()', () => {
    describe('should fill default allowedCorsOriginCollection', () => {
      test('with no allowedCorsOriginCollection', () => {
        const share = AdminGraphqlShare.create({})

        expect(share.allowedCorsOriginCollection)
          .toBeInstanceOf(AllowedCorsOriginCollection)
        expect(share.allowedCorsOriginCollection.extractOrigins())
          .toEqual([])
      })
    })
  })
})

describe('AdminGraphqlShare', () => {
  describe('.createAsync()', () => {
    describe('to keep the origins CORS_ADMIN_ORIGINS declares', () => {
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
        jest.spyOn(AdminGraphqlShare, 'generateEnv')
          .mockReturnValueOnce(/** @type {*} */ ({
            CORS_ADMIN_ORIGINS: input.originsString,
          }))

        const share = await AdminGraphqlShare.createAsync({
          config: /** @type {*} */ ({
            redisOptions: null,
          }),
        })

        const actual = share.allowedCorsOriginCollection.extractOrigins()

        expect(actual)
          .toEqual(expected)
      })
    })

    describe('to keep no origins when CORS_ADMIN_ORIGINS declares none', () => {
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

      test.each(cases)('env: $input.env', async ({ input }) => {
        jest.spyOn(AdminGraphqlShare, 'generateEnv')
          .mockReturnValueOnce(/** @type {*} */ (input.env))

        const share = await AdminGraphqlShare.createAsync({
          config: /** @type {*} */ ({
            redisOptions: null,
          }),
        })

        const actual = share.allowedCorsOriginCollection.extractOrigins()

        expect(actual)
          .toEqual([])
      })
    })
  })
})

describe('AdminGraphqlShare', () => {
  describe('.createAllowedCorsOriginCollection()', () => {
    describe('to be instance of AllowedCorsOriginCollection', () => {
      const cases = [
        {
          input: {
            env: {
              CORS_ADMIN_ORIGINS: 'https://alpha.example',
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
        const actual = AdminGraphqlShare.createAllowedCorsOriginCollection({
          env: /** @type {*} */ (input.env),
        })

        expect(actual)
          .toBeInstanceOf(AllowedCorsOriginCollection)
      })
    })

    describe('to keep the value of CORS_ADMIN_ORIGINS', () => {
      const cases = [
        {
          input: {
            env: {
              CORS_ADMIN_ORIGINS: 'https://alpha.example',
            },
          },
          expected: 'https://alpha.example',
        },
        {
          input: {
            env: {
              CORS_ADMIN_ORIGINS: 'https://alpha.example,https://beta.example',
            },
          },
          expected: 'https://alpha.example,https://beta.example',
        },
        {
          input: {
            env: {
              CORS_ADMIN_ORIGINS: '',
            },
          },
          expected: '',
        },
      ]

      test.each(cases)('env: $input.env', ({ input, expected }) => {
        const actual = AdminGraphqlShare.createAllowedCorsOriginCollection({
          env: /** @type {*} */ (input.env),
        })

        expect(actual)
          .toHaveProperty('originsString', expected)
      })
    })
  })
})
