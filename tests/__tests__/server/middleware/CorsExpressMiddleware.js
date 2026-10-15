import cors from 'cors'

import Env from '@openreachtech/renchan-env'

import {
  BaseExpressMiddleware,
} from '@openreachtech/renchan'

import CorsExpressMiddleware from '../../../../server/middleware/CorsExpressMiddleware.js'

import AllowedCorsOriginCollection from '../../../../server/tools/AllowedCorsOriginCollection.js'

import AdminGraphqlServerEngine from '../../../../server/graphql/AdminGraphqlServerEngine.js'
import AdminGraphqlShare from '../../../../server/graphql/contexts/AdminGraphqlShare.js'
import CustomerGraphqlServerEngine from '../../../../server/graphql/CustomerGraphqlServerEngine.js'
import CustomerGraphqlShare from '../../../../server/graphql/contexts/CustomerGraphqlShare.js'

const {
  EnvironmentFacade,
} = Env

describe('CorsExpressMiddleware', () => {
  describe('inheritance', () => {
    test('should be correct class', () => {
      const received = CorsExpressMiddleware.prototype

      expect(received)
        .toBeInstanceOf(BaseExpressMiddleware)
    })
  })
})

describe('CorsExpressMiddleware', () => {
  describe('constructor', () => {
    describe('should keep property', () => {
      describe('#engine', () => {
        const cases = [
          {
            input: {
              engine: new AdminGraphqlServerEngine({
                config: AdminGraphqlServerEngine.config,
                share: AdminGraphqlShare.create({}),
                errorHash: {},
              }),
            },
          },
          {
            input: {
              engine: new CustomerGraphqlServerEngine({
                config: CustomerGraphqlServerEngine.config,
                share: CustomerGraphqlShare.create({}),
                errorHash: {},
              }),
            },
          },
        ]

        test.each(cases)('engine: $input.engine.constructor.name', ({ input }) => {
          const middleware = new CorsExpressMiddleware(input)

          expect(middleware)
            .toHaveProperty('engine', input.engine)
        })
      })
    })
  })
})

describe('CorsExpressMiddleware', () => {
  describe('.create()', () => {
    const cases = [
      {
        input: {
          engine: new AdminGraphqlServerEngine({
            config: AdminGraphqlServerEngine.config,
            share: AdminGraphqlShare.create({}),
            errorHash: {},
          }),
        },
      },
      {
        input: {
          engine: new CustomerGraphqlServerEngine({
            config: CustomerGraphqlServerEngine.config,
            share: CustomerGraphqlShare.create({}),
            errorHash: {},
          }),
        },
      },
    ]

    describe('should be an instance of own class', () => {
      test.each(cases)('engine: $input.engine.constructor.name', ({ input }) => {
        const received = CorsExpressMiddleware.create(input)

        expect(received)
          .toBeInstanceOf(CorsExpressMiddleware)
      })
    })

    describe('should be called by constructor', () => {
      test.each(cases)('engine: $input.engine.constructor.name', ({ input }) => {
        const SpyClass = globalThis.constructorSpy.spyOn(CorsExpressMiddleware)

        SpyClass.create(input)

        expect(SpyClass.__spy__)
          .toHaveBeenCalledWith(input)
      })
    })
  })
})

describe('CorsExpressMiddleware', () => {
  describe('.get:corsClient', () => {
    describe('when called as is', () => {
      test('should be the cors library', () => {
        const received = CorsExpressMiddleware.corsClient

        expect(received)
          .toBe(cors) // same reference
      })
    })
  })
})

describe('CorsExpressMiddleware', () => {
  describe('#get:Ctor', () => {
    class AlphaCorsExpressMiddleware extends CorsExpressMiddleware {}

    class BetaCorsExpressMiddleware extends CorsExpressMiddleware {}

    const engine = new AdminGraphqlServerEngine({
      config: AdminGraphqlServerEngine.config,
      share: AdminGraphqlShare.create({}),
      errorHash: {},
    })

    describe('should be constructor of instance', () => {
      const cases = [
        {
          input: {
            Middleware: CorsExpressMiddleware,
          },
          expected: CorsExpressMiddleware,
        },
        {
          input: {
            Middleware: AlphaCorsExpressMiddleware,
          },
          expected: AlphaCorsExpressMiddleware,
        },
        {
          input: {
            Middleware: BetaCorsExpressMiddleware,
          },
          expected: BetaCorsExpressMiddleware,
        },
      ]

      test.each(cases)('Middleware: $input.Middleware.name', ({ input, expected }) => {
        const middleware = new input.Middleware({
          engine,
        })

        const received = middleware.Ctor

        expect(received)
          .toBe(expected) // same reference
      })
    })
  })
})

describe('CorsExpressMiddleware', () => {
  describe('#get:env', () => {
    describe('should be the env of the share', () => {
      const cases = [
        {
          input: {
            env: new EnvironmentFacade({
              environmentHash: {
                CORS_ADMIN_ORIGINS: 'https://alpha.example',
              },
            })
              .generateFacade(),
          },
        },
        {
          input: {
            env: new EnvironmentFacade({
              environmentHash: {
                CORS_ADMIN_ORIGINS: 'https://beta.example',
              },
            })
              .generateFacade(),
          },
        },
      ]

      test.each(cases)('CORS_ADMIN_ORIGINS: $input.env.CORS_ADMIN_ORIGINS', ({ input }) => {
        const engine = new AdminGraphqlServerEngine({
          config: AdminGraphqlServerEngine.config,
          share: AdminGraphqlShare.create({
            env: input.env,
          }),
          errorHash: {},
        })
        const middleware = CorsExpressMiddleware.create({
          engine,
        })

        const received = middleware.env

        expect(received)
          .toBe(input.env) // same reference
      })
    })
  })
})

describe('CorsExpressMiddleware', () => {
  describe('#get:originsString', () => {
    describe('should throw when a derived class does not override it', () => {
      test('with no override', () => {
        const engine = new AdminGraphqlServerEngine({
          config: AdminGraphqlServerEngine.config,
          share: AdminGraphqlShare.create({}),
          errorHash: {},
        })
        const middleware = CorsExpressMiddleware.create({
          engine,
        })

        expect(() => middleware.originsString)
          .toThrow('101.X000.001 {"memberName":"CorsExpressMiddleware#get:originsString"}')
      })
    })
  })
})

describe('CorsExpressMiddleware', () => {
  describe('#createAllowedCorsOriginCollection()', () => {
    const engine = new AdminGraphqlServerEngine({
      config: AdminGraphqlServerEngine.config,
      share: AdminGraphqlShare.create({}),
      errorHash: {},
    })

    describe('should keep the origins string the derived class reads', () => {
      const cases = [
        {
          override: {
            originsString: 'https://alpha.example',
          },
          expected: 'https://alpha.example',
        },
        {
          override: {
            originsString: null,
          },
          expected: null,
        },
      ]

      test.each(cases)('originsString: $override.originsString', ({ override, expected }) => {
        const middleware = CorsExpressMiddleware.create({
          engine,
        })
        jest.spyOn(middleware, 'originsString', 'get')
          .mockReturnValue(override.originsString)

        const received = middleware.createAllowedCorsOriginCollection()

        expect(received)
          .toBeInstanceOf(AllowedCorsOriginCollection)
        expect(received)
          .toHaveProperty('originsString', expected)
      })
    })
  })
})

describe('CorsExpressMiddleware', () => {
  describe('#composeMiddleware()', () => {
    const engine = new AdminGraphqlServerEngine({
      config: AdminGraphqlServerEngine.config,
      share: AdminGraphqlShare.create({}),
      errorHash: {},
    })

    const cases = [
      {
        override: {
          originsString: 'https://alpha.example',
        },
      },
      {
        override: {
          originsString: null,
        },
      },
    ]

    describe('should build the option hash once', () => {
      test.each(cases)('originsString: $override.originsString', ({ override }) => {
        const middleware = CorsExpressMiddleware.create({
          engine,
        })
        jest.spyOn(middleware, 'originsString', 'get')
          .mockReturnValue(override.originsString)
        const buildOptionHashSpy = jest.spyOn(middleware, 'buildOptionHash')

        middleware.composeMiddleware()

        expect(buildOptionHashSpy)
          .toHaveBeenCalledTimes(1)
      })
    })

    describe('should return the middleware function the cors library builds', () => {
      test.each(cases)('originsString: $override.originsString', ({ override }) => {
        const middleware = CorsExpressMiddleware.create({
          engine,
        })
        jest.spyOn(middleware, 'originsString', 'get')
          .mockReturnValue(override.originsString)

        const received = middleware.composeMiddleware()

        expect(received)
          .toBeInstanceOf(Function)
      })
    })
  })
})

describe('CorsExpressMiddleware', () => {
  describe('#buildOptionHash()', () => {
    const engine = new AdminGraphqlServerEngine({
      config: AdminGraphqlServerEngine.config,
      share: AdminGraphqlShare.create({}),
      errorHash: {},
    })

    describe('should declare the origins the derived class reads', () => {
      const cases = [
        {
          override: {
            originsString: 'https://alpha.example',
          },
          expected: {
            origin: [
              'https://alpha.example',
            ],
          },
        },
        {
          override: {
            originsString: ' https://alpha.example , https://beta.example ',
          },
          expected: {
            origin: [
              'https://alpha.example',
              'https://beta.example',
            ],
          },
        },
        {
          override: {
            originsString: null,
          },
          expected: {
            origin: [],
          },
        },
      ]

      test.each(cases)('originsString: $override.originsString', ({ override, expected }) => {
        const middleware = CorsExpressMiddleware.create({
          engine,
        })
        jest.spyOn(middleware, 'originsString', 'get')
          .mockReturnValue(override.originsString)

        const received = middleware.buildOptionHash()

        expect(received)
          .toStrictEqual(expected)
      })
    })
  })
})
