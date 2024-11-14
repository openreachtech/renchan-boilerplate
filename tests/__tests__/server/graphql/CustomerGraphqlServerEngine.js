import {
  BigNumberScalar,
  DateTimeScalar,
} from '@openreachtech/renchan'

import {
  rootPath,
} from '../../../../app/globals/_.js'

import CustomerGraphqlServerEngine from '../../../../server/graphql/CustomerGraphqlServerEngine.js'

import BaseAppGraphqlServerEngine from '../../../../server/graphql/BaseAppGraphqlServerEngine.js'
import CustomerGraphqlContext from '../../../../server/graphql/contexts/CustomerGraphqlContext.js'
import CustomerGraphqlShare from '../../../../server/graphql/contexts/CustomerGraphqlShare.js'

describe('CustomerGraphqlServerEngine', () => {
  describe('super class', () => {
    test('to be instance of base class', () => {
      const actual = CustomerGraphqlServerEngine.prototype

      expect(actual)
        .toBeInstanceOf(BaseAppGraphqlServerEngine)
    })
  })
})

describe('CustomerGraphqlServerEngine', () => {
  describe('.get:config', () => {
    test('to be fixed value', () => {
      const expected = {
        graphqlEndpoint: '/graphql-customer',
        staticPath: rootPath.to('public/'),
        schemaPath: rootPath.to('server/graphql/schemas/customer.graphql'),
        actualResolversPath: rootPath.to('server/graphql/resolvers/customer/actual/'),
        stubResolversPath: rootPath.to('server/graphql/resolvers/customer/stub/'),
        redisOptions: null,
      }

      const actual = CustomerGraphqlServerEngine.config

      expect(actual)
        .toStrictEqual(expected)
    })
  })
})

describe('CustomerGraphqlServerEngine', () => {
  describe('#generateFilterHandler()', () => {
    describe('to be instance of Function', () => {
      test('with no parameter', async () => {
        const engine = await CustomerGraphqlServerEngine.createAsync()

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
            context: CustomerGraphqlContext.create({
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
            context: CustomerGraphqlContext.create({
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
          const engine = await CustomerGraphqlServerEngine.createAsync()

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
          const engine = await CustomerGraphqlServerEngine.createAsync()

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
            .toThrow('[12.00.01] unauthenticated')

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
          const engine = await CustomerGraphqlServerEngine.createAsync()

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
            .toThrow('[12.00.02] unauthorized')

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
            const engine = await CustomerGraphqlServerEngine.createAsync()

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
              .toThrow(/^\[12.00.03\] denied schema permission \[.+\]/u)

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

describe('CustomerGraphqlServerEngine', () => {
  describe('.get:Share', () => {
    test('to be bridge class', () => {
      const actual = CustomerGraphqlServerEngine.Share

      expect(actual)
        .toBe(CustomerGraphqlShare) // same reference
    })
  })
})

describe('CustomerGraphqlServerEngine', () => {
  describe('.get:Context', () => {
    test('to be bridge class', () => {
      const actual = CustomerGraphqlServerEngine.Context

      expect(actual)
        .toBe(CustomerGraphqlContext) // same reference
    })
  })
})

describe('CustomerGraphqlServerEngine', () => {
  describe('#collectScalars()', () => {
    test('to be fixed value', async () => {
      const engine = await CustomerGraphqlServerEngine.createAsync()

      const expected = [
        BigNumberScalar,
        DateTimeScalar,
      ]

      const actual = await engine.collectScalars()

      expect(actual)
        .toEqual(expected)
    })
  })
})
