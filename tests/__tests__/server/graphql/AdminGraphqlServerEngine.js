import {
  rootPath,
} from '../../../../app/globals/_.js'

import AdminGraphqlServerEngine from '../../../../server/graphql/AdminGraphqlServerEngine.js'

import BaseAppGraphqlServerEngine from '../../../../server/graphql/BaseAppGraphqlServerEngine.js'

import AdminGraphqlContext from '../../../../server/graphql/contexts/AdminGraphqlContext.js'
import AdminGraphqlShare from '../../../../server/graphql/contexts/AdminGraphqlShare.js'

import AdminCorsExpressMiddleware from '../../../../server/middleware/AdminCorsExpressMiddleware.js'

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
  describe('.get:ExpressMiddleware', () => {
    describe('when called as is', () => {
      test('should be the CORS middleware', () => {
        const expected = [
          AdminCorsExpressMiddleware,
        ]

        const received = AdminGraphqlServerEngine.ExpressMiddleware

        expect(received)
          .toStrictEqual(expected)
      })
    })
  })
})

describe('AdminGraphqlServerEngine', () => {
  describe('#collectMiddleware()', () => {
    describe('to mount the upload middleware', () => {
      test('should be five middleware', () => {
        const engine = new AdminGraphqlServerEngine({
          config: /** @type {*} */ ({
            staticPath: rootPath.to('public/'),
          }),
          share: AdminGraphqlShare.create({
            env: /** @type {*} */ ({
              CORS_ADMIN_ORIGINS: null,
            }),
          }),
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
})

describe('AdminGraphqlServerEngine', () => {
  describe('#collectMiddleware()', () => {
    describe('to allow an origin the share declares', () => {
      const cases = [
        {
          input: {
            origin: 'https://alpha.example',
          },
        },
        {
          input: {
            origin: 'https://beta.example',
          },
        },
      ]

      test.each(cases)('origin: $input.origin', ({ input }) => {
        const engine = new AdminGraphqlServerEngine({
          config: /** @type {*} */ ({
            staticPath: rootPath.to('public/'),
          }),
          share: AdminGraphqlShare.create({
            env: /** @type {*} */ ({
              CORS_ADMIN_ORIGINS: 'https://alpha.example,https://beta.example',
            }),
          }),
          errorHash: {},
        })

        const [corsMiddleware] = engine.collectMiddleware()

        const requestMock = /** @type {*} */ ({
          method: 'GET',
          headers: {
            origin: input.origin,
          },
        })
        const responseMock = /** @type {*} */ ({
          getHeader: jest.fn(),
          setHeader: jest.fn(),
        })
        const nextMock = jest.fn()

        corsMiddleware(requestMock, responseMock, nextMock)

        expect(responseMock.setHeader)
          .toHaveBeenCalledWith('Access-Control-Allow-Origin', input.origin)
      })
    })

    describe('to refuse an origin the share does not declare', () => {
      const cases = [
        {
          input: {
            origin: 'https://gamma.example',
          },
        },
        {
          input: {
            origin: 'http://localhost:3000',
          },
        },
      ]

      test.each(cases)('origin: $input.origin', ({ input }) => {
        const engine = new AdminGraphqlServerEngine({
          config: /** @type {*} */ ({
            staticPath: rootPath.to('public/'),
          }),
          share: AdminGraphqlShare.create({
            env: /** @type {*} */ ({
              CORS_ADMIN_ORIGINS: 'https://alpha.example',
            }),
          }),
          errorHash: {},
        })

        const [corsMiddleware] = engine.collectMiddleware()

        const requestMock = /** @type {*} */ ({
          method: 'GET',
          headers: {
            origin: input.origin,
          },
        })
        const responseMock = /** @type {*} */ ({
          getHeader: jest.fn(),
          setHeader: jest.fn(),
        })
        const nextMock = jest.fn()

        corsMiddleware(requestMock, responseMock, nextMock)

        expect(responseMock.setHeader)
          .toHaveBeenCalledTimes(1)
        expect(responseMock.setHeader)
          .toHaveBeenCalledWith('Vary', 'Origin')
      })
    })

    describe('to refuse every origin when the share declares none', () => {
      const cases = [
        {
          input: {
            origin: 'https://alpha.example',
          },
        },
        {
          input: {
            origin: 'http://localhost:3000',
          },
        },
      ]

      test.each(cases)('origin: $input.origin', ({ input }) => {
        const engine = new AdminGraphqlServerEngine({
          config: /** @type {*} */ ({
            staticPath: rootPath.to('public/'),
          }),
          share: AdminGraphqlShare.create({
            env: /** @type {*} */ ({
              CORS_ADMIN_ORIGINS: null,
            }),
          }),
          errorHash: {},
        })

        const [corsMiddleware] = engine.collectMiddleware()

        const requestMock = /** @type {*} */ ({
          method: 'GET',
          headers: {
            origin: input.origin,
          },
        })
        const responseMock = /** @type {*} */ ({
          getHeader: jest.fn(),
          setHeader: jest.fn(),
        })
        const nextMock = jest.fn()

        corsMiddleware(requestMock, responseMock, nextMock)

        expect(responseMock.setHeader)
          .toHaveBeenCalledTimes(1)
        expect(responseMock.setHeader)
          .toHaveBeenCalledWith('Vary', 'Origin')
      })
    })
  })
})

describe('AdminGraphqlServerEngine', () => {
  describe('#composeExpressMiddleware()', () => {
    describe('should compose the middleware of .get:ExpressMiddleware', () => {
      const cases = [
        {
          input: {
            originsString: 'https://alpha.example',
          },
        },
        {
          input: {
            originsString: null,
          },
        },
      ]

      test.each(cases)('originsString: $input.originsString', ({ input }) => {
        const engine = new AdminGraphqlServerEngine({
          config: /** @type {*} */ ({
            staticPath: rootPath.to('public/'),
          }),
          share: AdminGraphqlShare.create({
            env: /** @type {*} */ ({
              CORS_ADMIN_ORIGINS: input.originsString,
            }),
          }),
          errorHash: {},
        })

        const received = engine.composeExpressMiddleware()

        expect(received)
          .toEqual([
            expect.any(Function),
          ])
      })
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
