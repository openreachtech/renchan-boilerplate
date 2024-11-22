import {
  DateTimeScalar,
} from '@openreachtech/renchan'

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
        staticPath: rootPath.to('public/'),
        schemaPath: rootPath.to('server/graphql/schemas/admin.graphql'),
        actualResolversPath: rootPath.to('server/graphql/resolvers/admin/actual/'),
        stubResolversPath: rootPath.to('server/graphql/resolvers/admin/stub/'),
        redisOptions: null,
      }

      const actual = AdminGraphqlServerEngine.config

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
      const engineMock = /** @type {*} */ ({})
      const visaMock = /** @type {*} */ ({})

      const cases = [
        {
          params: {
            context: AdminGraphqlContext.create({
              expressRequest: expressRequestMock,
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
            .toThrow('12.00.01')

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
            .toThrow('12.00.02')

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
              .toThrow(/^12.00.03 \{"schema":".+"\}/u)

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

      const expected = [
        DateTimeScalar,
      ]

      const actual = await engine.collectScalars()

      expect(actual)
        .toEqual(expected)
    })
  })
})
