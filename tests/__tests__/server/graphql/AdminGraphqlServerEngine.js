import Env from '@openreachtech/renchan-env'

import {
  rootPath,
} from '../../../../app/globals/_.js'

import AdminGraphqlServerEngine from '../../../../server/graphql/AdminGraphqlServerEngine.js'

import BaseAppGraphqlServerEngine from '../../../../server/graphql/BaseAppGraphqlServerEngine.js'

import AdminGraphqlContext from '../../../../server/graphql/contexts/AdminGraphqlContext.js'
import AdminGraphqlShare from '../../../../server/graphql/contexts/AdminGraphqlShare.js'

import AdminCorsExpressMiddleware from '../../../../server/middleware/AdminCorsExpressMiddleware.js'

import MockExpressRequest from '../../../mocks/MockExpressRequest.js'
import MockExpressResponse from '../../../mocks/MockExpressResponse.js'

const {
  EnvironmentFacade,
} = Env

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
          config: AdminGraphqlServerEngine.config,
          share: AdminGraphqlShare.create({
            env: new EnvironmentFacade({
              environmentHash: {
                CORS_ADMIN_ORIGINS: null,
              },
            })
              .generateFacade(),
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
          config: AdminGraphqlServerEngine.config,
          share: AdminGraphqlShare.create({
            env: new EnvironmentFacade({
              environmentHash: {
                CORS_ADMIN_ORIGINS: 'https://alpha.example,https://beta.example',
              },
            })
              .generateFacade(),
          }),
          errorHash: {},
        })

        const [corsMiddleware] = engine.collectMiddleware()
        const mockRequest = MockExpressRequest.create({
          method: 'GET',
          origin: input.origin,
        })
        const mockResponse = MockExpressResponse.create()

        corsMiddleware(mockRequest, mockResponse, () => {})

        expect(mockResponse.getHeader('Access-Control-Allow-Origin'))
          .toBe(input.origin)
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
          config: AdminGraphqlServerEngine.config,
          share: AdminGraphqlShare.create({
            env: new EnvironmentFacade({
              environmentHash: {
                CORS_ADMIN_ORIGINS: 'https://alpha.example',
              },
            })
              .generateFacade(),
          }),
          errorHash: {},
        })

        const [corsMiddleware] = engine.collectMiddleware()
        const mockRequest = MockExpressRequest.create({
          method: 'GET',
          origin: input.origin,
        })
        const mockResponse = MockExpressResponse.create()

        corsMiddleware(mockRequest, mockResponse, () => {})

        expect(mockResponse.getHeader('Access-Control-Allow-Origin'))
          .toBeUndefined()
        expect(mockResponse.getHeader('Vary'))
          .toBe('Origin')
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
          config: AdminGraphqlServerEngine.config,
          share: AdminGraphqlShare.create({
            env: new EnvironmentFacade({
              environmentHash: {
                CORS_ADMIN_ORIGINS: null,
              },
            })
              .generateFacade(),
          }),
          errorHash: {},
        })

        const [corsMiddleware] = engine.collectMiddleware()
        const mockRequest = MockExpressRequest.create({
          method: 'GET',
          origin: input.origin,
        })
        const mockResponse = MockExpressResponse.create()

        corsMiddleware(mockRequest, mockResponse, () => {})

        expect(mockResponse.getHeader('Access-Control-Allow-Origin'))
          .toBeUndefined()
        expect(mockResponse.getHeader('Vary'))
          .toBe('Origin')
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
          config: AdminGraphqlServerEngine.config,
          share: AdminGraphqlShare.create({
            env: new EnvironmentFacade({
              environmentHash: {
                CORS_ADMIN_ORIGINS: input.originsString,
              },
            })
              .generateFacade(),
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
