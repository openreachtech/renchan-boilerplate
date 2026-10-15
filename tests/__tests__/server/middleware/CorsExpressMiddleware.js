import cors from 'cors'

import {
  BaseExpressMiddleware,
} from '@openreachtech/renchan'

import CorsExpressMiddleware from '../../../../server/middleware/CorsExpressMiddleware.js'

import AllowedCorsOriginCollection from '../../../../server/tools/AllowedCorsOriginCollection.js'

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
              engine: /** @type {*} */ ({
                name: 'alpha',
              }),
            },
          },
          {
            input: {
              engine: /** @type {*} */ ({
                name: 'beta',
              }),
            },
          },
        ]

        test.each(cases)('engine.name: $input.engine.name', ({ input }) => {
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
    describe('should be an instance of own class', () => {
      const cases = [
        {
          input: {
            engine: /** @type {*} */ ({
              name: 'alpha',
            }),
          },
        },
        {
          input: {
            engine: /** @type {*} */ ({
              name: 'beta',
            }),
          },
        },
      ]

      test.each(cases)('engine.name: $input.engine.name', ({ input }) => {
        const received = CorsExpressMiddleware.create(input)

        expect(received)
          .toBeInstanceOf(CorsExpressMiddleware)
      })
    })

    describe('should be called by constructor', () => {
      const cases = [
        {
          input: {
            engine: /** @type {*} */ ({
              name: 'alpha',
            }),
          },
        },
        {
          input: {
            engine: /** @type {*} */ ({
              name: 'beta',
            }),
          },
        },
      ]

      test.each(cases)('engine.name: $input.engine.name', ({ input }) => {
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
          engine: /** @type {*} */ ({}),
        })

        const received = middleware.Ctor

        expect(received)
          .toBe(expected) // same reference
      })
    })
  })
})

describe('CorsExpressMiddleware', () => {
  describe('#get:allowedCorsOriginCollection', () => {
    describe('should be the collection of the share', () => {
      const cases = [
        {
          input: {
            engine: /** @type {*} */ ({
              share: {
                allowedCorsOriginCollection: AllowedCorsOriginCollection.create({
                  originsString: 'https://alpha.example',
                }),
              },
            }),
          },
        },
        {
          input: {
            engine: /** @type {*} */ ({
              share: {
                allowedCorsOriginCollection: AllowedCorsOriginCollection.create({
                  originsString: null,
                }),
              },
            }),
          },
        },
      ]

      test.each(cases)('originsString: $input.engine.share.allowedCorsOriginCollection.originsString', ({ input }) => {
        const middleware = CorsExpressMiddleware.create(input)

        const received = middleware.allowedCorsOriginCollection

        expect(received)
          .toBe(input.engine.share.allowedCorsOriginCollection) // same reference
      })
    })
  })
})

describe('CorsExpressMiddleware', () => {
  describe('#composeMiddleware()', () => {
    describe('should call corsClient() with the option hash', () => {
      const cases = [
        {
          input: {
            originsString: 'https://alpha.example',
          },
          expected: {
            origin: [
              'https://alpha.example',
            ],
          },
        },
        {
          input: {
            originsString: 'https://alpha.example,https://beta.example',
          },
          expected: {
            origin: [
              'https://alpha.example',
              'https://beta.example',
            ],
          },
        },
        {
          input: {
            originsString: null,
          },
          expected: {
            origin: [],
          },
        },
      ]

      test.each(cases)('originsString: $input.originsString', ({ input, expected }) => {
        const corsClientSpy = jest.fn()

        class SpiedCorsExpressMiddleware extends CorsExpressMiddleware {
          /** @override */
          static get corsClient () {
            return /** @type {*} */ (corsClientSpy)
          }
        }

        const middleware = SpiedCorsExpressMiddleware.create({
          engine: /** @type {*} */ ({
            share: {
              allowedCorsOriginCollection: AllowedCorsOriginCollection.create(input),
            },
          }),
        })

        middleware.composeMiddleware()

        expect(corsClientSpy)
          .toHaveBeenCalledWith(expected)
      })
    })

    describe('should return what corsClient() returns', () => {
      const cases = [
        {
          input: {
            composed: {
              name: 'alpha',
            },
          },
        },
        {
          input: {
            composed: {
              name: 'beta',
            },
          },
        },
      ]

      test.each(cases)('composed.name: $input.composed.name', ({ input }) => {
        class SpiedCorsExpressMiddleware extends CorsExpressMiddleware {
          /** @override */
          static get corsClient () {
            return /** @type {*} */ (() => input.composed)
          }
        }

        const middleware = SpiedCorsExpressMiddleware.create({
          engine: /** @type {*} */ ({
            share: {
              allowedCorsOriginCollection: AllowedCorsOriginCollection.create({
                originsString: null,
              }),
            },
          }),
        })

        const received = middleware.composeMiddleware()

        expect(received)
          .toBe(input.composed) // same reference
      })
    })
  })
})

describe('CorsExpressMiddleware', () => {
  describe('#buildOptionHash()', () => {
    describe('should declare the origins of the collection', () => {
      const cases = [
        {
          input: {
            originsString: 'https://alpha.example',
          },
          expected: {
            origin: [
              'https://alpha.example',
            ],
          },
        },
        {
          input: {
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
          input: {
            originsString: null,
          },
          expected: {
            origin: [],
          },
        },
      ]

      test.each(cases)('originsString: $input.originsString', ({ input, expected }) => {
        const middleware = CorsExpressMiddleware.create({
          engine: /** @type {*} */ ({
            share: {
              allowedCorsOriginCollection: AllowedCorsOriginCollection.create(input),
            },
          }),
        })

        const received = middleware.buildOptionHash()

        expect(received)
          .toStrictEqual(expected)
      })
    })
  })
})
