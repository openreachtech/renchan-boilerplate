import {
  rootPath,
} from '../../../../app/globals/_.js'

import AdminGraphqlServerEngine from '../../../../server/graphql/AdminGraphqlServerEngine.js'

import BaseAppGraphqlServerEngine from '../../../../server/graphql/BaseAppGraphqlServerEngine.js'

import AdminGraphqlContext from '../../../../server/graphql/contexts/AdminGraphqlContext.js'
import AdminGraphqlShare from '../../../../server/graphql/contexts/AdminGraphqlShare.js'

describe('AdminGraphqlServerEngine', () => {
  describe('super class', () => {
    test('to be instance of base class', () => {
      const actual = AdminGraphqlServerEngine.prototype

      expect(actual)
        .toBeInstanceOf(BaseAppGraphqlServerEngine)
    })
  })
})

describe('AdminGraphqlServerEngine', () => {
  describe('.get:config', () => {
    test('to be fixed value', () => {
      const expected = {
        graphqlEndpoint: '/graphql-admin',
        refreshTokenCookie: {
          lifetimeDays: 14,
          secure: true,
          sameSite: 'lax',
          httpOnly: true,
          name: 'admin_refresh_token',
        },
        staticPath: rootPath.to('public/'),
        schemaPath: rootPath.to('server/graphql/schemas/admin.graphql'),
        actualResolversPath: rootPath.to('server/graphql/resolvers/admin/actual/'),
        stubResolversPath: rootPath.to('server/graphql/resolvers/admin/stub/'),
        postWorkersPath: null,
        redisOptions: null,
      }

      const actual = AdminGraphqlServerEngine.config

      expect(actual)
        .toStrictEqual(expected)
    })
  })
})

describe('AdminGraphqlServerEngine', () => {
  describe('.buildRefreshTokenCookieConfig()', () => {
    describe('to combine the shared config with the audience cookie name', () => {
      test('should be the admin cookie config', () => {
        const expected = {
          lifetimeDays: 14,
          secure: true,
          sameSite: 'lax',
          httpOnly: true,
          name: 'admin_refresh_token',
        }

        const actual = AdminGraphqlServerEngine.buildRefreshTokenCookieConfig()

        expect(actual)
          .toEqual(expected)
      })
    })
  })
})

describe('AdminGraphqlServerEngine', () => {
  describe('.get:standardErrorCodeHash', () => {
    test('to be fixed value', () => {
      const expected = {
        Unknown: '100.X000.001',
        ConcreteMemberNotFound: '101.X000.001',
        Unauthenticated: '102.X000.001',
        Unauthorized: '102.X000.002',
        DeniedSchemaPermission: '102.X000.003',
        Database: '104.X000.001',

        CanNotSubscribe: '102.S000.001',
      }
      const actual = AdminGraphqlServerEngine.standardErrorCodeHash

      expect(actual)
        .toStrictEqual(expected)
    })
  })
})

describe('AdminGraphqlServerEngine', () => {
  describe('#generateFilterHandler()', () => {
    describe('to be instance of Function', () => {
      test('with no parameter', async () => {
        const engine = await AdminGraphqlServerEngine.createAsync()

        const actual = engine.generateFilterHandler()

        expect(actual)
          .toBeInstanceOf(Function)
      })
    })

    describe('to call members of context via generated function', () => {
      const expressRequestMock = /** @type {*} */ ({})
      const requestParamsMock = /** @type {*} */ ({})
      const engineMock = /** @type {*} */ ({})
      const visaMock = /** @type {*} */ ({})

      const cases = [
        {
          params: {
            context: AdminGraphqlContext.create({
              expressRequest: expressRequestMock,
              requestParams: requestParamsMock,
              engine: engineMock,
              userEntity: {
                id: 10001,
              },
              visa: visaMock,
            }),
            information: {
              fieldName: 'alphaSchema',
            },
          },
          expected: {
            schema: 'alphaSchema',
          },
        },
        {
          params: {
            context: AdminGraphqlContext.create({
              expressRequest: expressRequestMock,
              requestParams: requestParamsMock,
              engine: engineMock,
              userEntity: {
                id: 10002,
              },
              visa: visaMock,
            }),
            information: {
              fieldName: 'betaSchema',
            },
          },
          expected: {
            schema: 'betaSchema',
          },
        },
      ]

      describe('context.canResolve() returns true', () => {
        test.each(cases)('fieldName: $params.information.fieldName', async ({ params, expected }) => {
          const engine = await AdminGraphqlServerEngine.createAsync()

          const canResolveSpy = jest.spyOn(params.context, 'canResolve')
            .mockReturnValueOnce(true)
          const hasAuthenticatedSpy = jest.spyOn(params.context, 'hasAuthenticated')

          const handler = engine.generateFilterHandler()

          const args = {
            variables: {},
            context: params.context,
            information: params.information,
            parent: {},
          }

          await handler(args)

          expect(canResolveSpy)
            .toHaveBeenCalledWith(expected)
          expect(hasAuthenticatedSpy)
            .not
            .toHaveBeenCalled()
        })
      })

      describe('context.hasAuthenticated() returns false', () => {
        test.each(cases)('fieldName: $params.information.fieldName', async ({ params, expected }) => {
          const engine = await AdminGraphqlServerEngine.createAsync()

          const canResolveSpy = jest.spyOn(params.context, 'canResolve')
            .mockReturnValueOnce(false)
          const hasAuthenticatedSpy = jest.spyOn(params.context, 'hasAuthenticated')
            .mockReturnValueOnce(false)
          const hasAuthorizedSpy = jest.spyOn(params.context, 'hasAuthorized')

          const handler = engine.generateFilterHandler()

          const args = {
            variables: {},
            context: params.context,
            information: params.information,
            parent: {},
          }

          await expect(handler(args))
            .rejects
            .toThrow('102.X000.001')

          expect(canResolveSpy)
            .toHaveBeenCalledWith(expected)
          expect(hasAuthenticatedSpy)
            .toHaveBeenCalledWith()
          expect(hasAuthorizedSpy)
            .not
            .toHaveBeenCalled()
        })
      })

      describe('context.hasAuthorized() returns false', () => {
        test.each(cases)('fieldName: $params.information.fieldName', async ({ params, expected }) => {
          const engine = await AdminGraphqlServerEngine.createAsync()

          const canResolveSpy = jest.spyOn(params.context, 'canResolve')
            .mockReturnValueOnce(false)
          const hasAuthenticatedSpy = jest.spyOn(params.context, 'hasAuthenticated')
            .mockReturnValueOnce(true)
          const hasAuthorizedSpy = jest.spyOn(params.context, 'hasAuthorized')
            .mockReturnValueOnce(false)
          const hasSchemaPermissionSpy = jest.spyOn(params.context, 'hasSchemaPermission')

          const handler = engine.generateFilterHandler()

          const args = {
            variables: {},
            context: params.context,
            information: params.information,
            parent: {},
          }

          await expect(handler(args))
            .rejects
            .toThrow('102.X000.002')

          expect(canResolveSpy)
            .toHaveBeenCalledWith(expected)
          expect(hasAuthenticatedSpy)
            .toHaveBeenCalledWith()
          expect(hasAuthorizedSpy)
            .toHaveBeenCalledWith()
          expect(hasSchemaPermissionSpy)
            .not
            .toHaveBeenCalled()
        })

        describe('context.hasSchemaPermission() returns false', () => {
          test.each(cases)('fieldName: $params.information.fieldName', async ({ params, expected }) => {
            const engine = await AdminGraphqlServerEngine.createAsync()

            const canResolveSpy = jest.spyOn(params.context, 'canResolve')
              .mockReturnValueOnce(false)
            const hasAuthenticatedSpy = jest.spyOn(params.context, 'hasAuthenticated')
              .mockReturnValueOnce(true)
            const hasAuthorizedSpy = jest.spyOn(params.context, 'hasAuthorized')
              .mockReturnValueOnce(true)
            const hasSchemaPermissionSpy = jest.spyOn(params.context, 'hasSchemaPermission')
              .mockReturnValueOnce(false)

            const handler = engine.generateFilterHandler()

            const args = {
              variables: {},
              context: params.context,
              information: params.information,
              parent: {},
            }
            const hasSchemaPermissionArgsExpected = {
              schema: expected.schema,
            }

            await expect(handler(args))
              .rejects
              .toThrow(/^102.X000.003 \{"schema":".+"\}/u)

            expect(canResolveSpy)
              .toHaveBeenCalledWith(expected)
            expect(hasAuthenticatedSpy)
              .toHaveBeenCalledWith()
            expect(hasAuthorizedSpy)
              .toHaveBeenCalledWith()
            expect(hasSchemaPermissionSpy)
              .toHaveBeenCalledWith(hasSchemaPermissionArgsExpected)
          })
        })
      })
    })
  })
})

describe('AdminGraphqlServerEngine', () => {
  describe('#collectMiddleware()', () => {
    test('to be fixed value', () => {
      const engine = new AdminGraphqlServerEngine({
        config: /** @type {*} */ ({
          staticPath: rootPath.to('public/'),
        }),
        share: /** @type {*} */ ({}),
        errorHash: {},
      })

      const expected = [
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
      ]

      const actual = engine.collectMiddleware()

      expect(actual)
        .toEqual(expected)
    })
  })
})

describe('AdminGraphqlServerEngine', () => {
  describe('.get:Share', () => {
    test('to be bridge class', () => {
      const actual = AdminGraphqlServerEngine.Share

      expect(actual)
        .toBe(AdminGraphqlShare) // same reference
    })
  })
})

describe('AdminGraphqlServerEngine', () => {
  describe('.get:Context', () => {
    test('to be bridge class', () => {
      const actual = AdminGraphqlServerEngine.Context

      expect(actual)
        .toBe(AdminGraphqlContext) // same reference
    })
  })
})

describe('AdminGraphqlServerEngine', () => {
  describe('#collectScalars()', () => {
    test('to be fixed value', async () => {
      const engine = await AdminGraphqlServerEngine.createAsync()

      const expected = []

      const actual = await engine.collectScalars()

      expect(actual)
        .toEqual(expected)
    })
  })
})
