import express from 'express'
import { createHandler } from 'graphql-http/lib/use/express'
import { buildSchema } from 'graphql'

import BaseAppGraphqlContext from '../../../../../server/graphql/contexts/BaseAppGraphqlContext.js'
import CustomerGraphqlContext from '../../../../../server/graphql/contexts/CustomerGraphqlContext.js'
import AdminGraphqlContext from '../../../../../server/graphql/contexts/AdminGraphqlContext.js'

/**
 * A context bound to a name and path of its own, so the abstract members have something concrete.
 */
class TestGraphqlContext extends BaseAppGraphqlContext {
  /** @override */
  static get REFRESH_TOKEN_COOKIE_NAME () {
    return 'test_refresh_token'
  }

  /** @override */
  static get REFRESH_TOKEN_COOKIE_PATH () {
    return '/graphql-test'
  }
}

/**
 * Build a request object shaped the way the express adapter of `graphql-http` builds one.
 *
 * @param {{
 *   cookieHeader?: string | null
 *   expressResponse?: * | null
 * }} [params] - Parameters.
 * @returns {*} - Request double.
 */
function createExpressRequest ({
  cookieHeader = null,
  expressResponse = null,
} = {}) {
  return {
    headers: cookieHeader
      ? { cookie: cookieHeader }
      : {},
    raw: {},
    context: {
      res: expressResponse,
    },
  }
}

/**
 * Build a context over such a request.
 *
 * @param {{
 *   cookieHeader?: string | null
 *   expressResponse?: * | null
 * }} [params] - Parameters.
 * @returns {TestGraphqlContext} - Context.
 */
function createContext (params = {}) {
  return /** @type {*} */ (
    TestGraphqlContext.create({
      expressRequest: createExpressRequest(params),
      requestParams: /** @type {*} */ ({}),
      engine: /** @type {*} */ ({}),
      userEntity: null,
      visa: /** @type {*} */ ({}),
    })
  )
}

describe('BaseAppGraphqlContext', () => {
  describe('.get:REFRESH_TOKEN_COOKIE_NAME', () => {
    test('should refuse to answer without a subclass', () => {
      expect(() => BaseAppGraphqlContext.REFRESH_TOKEN_COOKIE_NAME)
        .toThrow('BaseAppGraphqlContext.get:REFRESH_TOKEN_COOKIE_NAME must be inherited')
    })
  })

  describe('.get:REFRESH_TOKEN_COOKIE_PATH', () => {
    test('should refuse to answer without a subclass', () => {
      expect(() => BaseAppGraphqlContext.REFRESH_TOKEN_COOKIE_PATH)
        .toThrow('BaseAppGraphqlContext.get:REFRESH_TOKEN_COOKIE_PATH must be inherited')
    })
  })
})

describe('BaseAppGraphqlContext', () => {
  describe('.generateRefreshTokenCookieOptions()', () => {
    test('should carry the four attributes an HttpOnly cookie requires', () => {
      const actual = TestGraphqlContext.generateRefreshTokenCookieOptions()

      expect(actual)
        .toHaveProperty('httpOnly', true)
      expect(actual)
        .toHaveProperty('sameSite', 'lax')
      expect(actual)
        .toHaveProperty('path', '/graphql-test')
      expect(actual)
        .toHaveProperty('secure')
    })

    test('should name no Domain', () => {
      // Naming one widens the cookie to every subdomain, and a single XSS on any of them would
      // reach it.
      const actual = TestGraphqlContext.generateRefreshTokenCookieOptions()

      expect(actual)
        .not
        .toHaveProperty('domain')
    })
  })
})

describe('BaseAppGraphqlContext', () => {
  describe('#extractRefreshToken()', () => {
    describe('should read its own cookie out of the header', () => {
      const cases = [
        {
          params: {
            cookieHeader: 'test_refresh_token=token-0001',
          },
          expected: 'token-0001',
        },
        {
          params: {
            cookieHeader: 'other=1; test_refresh_token=token-0002; another=2',
          },
          expected: 'token-0002',
        },
      ]

      test.each(cases)('cookieHeader: $params.cookieHeader', ({ params, expected }) => {
        const actual = createContext(params)
          .extractRefreshToken()

        expect(actual)
          .toBe(expected)
      })
    })

    describe('should answer null when its cookie is absent', () => {
      const cases = [
        {
          params: {
            cookieHeader: null,
          },
        },
        {
          params: {
            cookieHeader: 'other=1; another=2',
          },
        },
        {
          params: {
            // A different audience's cookie is not this one.
            cookieHeader: 'admin_refresh_token=token-0003',
          },
        },
      ]

      test.each(cases)('cookieHeader: $params.cookieHeader', ({ params }) => {
        const actual = createContext(params)
          .extractRefreshToken()

        expect(actual)
          .toBeNull()
      })
    })
  })
})

describe('BaseAppGraphqlContext', () => {
  describe('#get:expressResponse', () => {
    test('should reach the express response through the graphql-http request', () => {
      // renchan hands a context only the request. The express adapter of graphql-http builds that
      // request as { raw, context: { res } }, which is the only route to the response — and the
      // whole reason the refresh cookie can be issued from a resolver at all.
      const expressResponse = /** @type {*} */ ({ marker: 'response' })

      const actual = createContext({ expressResponse })
        .expressResponse

      expect(actual)
        .toBe(expressResponse) // same reference
    })

    test('should answer null outside an HTTP request', () => {
      const actual = createContext()
        .expressResponse

      expect(actual)
        .toBeNull()
    })
  })
})

describe('CustomerGraphqlContext / AdminGraphqlContext', () => {
  describe('cookie binding', () => {
    test('should keep the two audiences on separate names and paths', () => {
      // The browser must never even send the viewer's cookie to the admin endpoint.
      expect(CustomerGraphqlContext.REFRESH_TOKEN_COOKIE_NAME)
        .toBe('customer_refresh_token')
      expect(CustomerGraphqlContext.REFRESH_TOKEN_COOKIE_PATH)
        .toBe('/graphql-customer')

      expect(AdminGraphqlContext.REFRESH_TOKEN_COOKIE_NAME)
        .toBe('admin_refresh_token')
      expect(AdminGraphqlContext.REFRESH_TOKEN_COOKIE_PATH)
        .toBe('/graphql-admin')

      expect(CustomerGraphqlContext.REFRESH_TOKEN_COOKIE_NAME)
        .not
        .toBe(AdminGraphqlContext.REFRESH_TOKEN_COOKIE_NAME)
    })
  })
})

describe('BaseAppGraphqlContext', () => {
  describe('cookies written from a resolver', () => {
    /**
     * Run one GraphQL request against a real server and report what came back.
     *
     * **A real round trip, not a spy.** `graphql-http` finishes a request with
     * `res.writeHead(status, statusText, headers).end(body)`, and this whole design rests on node
     * merging headers set with `setHeader()` into that call. A spy on `res.cookie()` would pass
     * even if the header never reached the wire, which is precisely the failure worth catching.
     *
     * @param {{
     *   resolve: (variables: *, context: *) => *
     *   cookieHeader?: string | null
     * }} params - Parameters.
     * @returns {Promise<{ setCookie: Array<string>, body: * }>} - What the client received.
     */
    async function callGraphqlServer ({
      resolve,
      cookieHeader = null,
    }) {
      const schema = buildSchema('type Query { ping: String! }')

      const app = express()

      app.use(express.json())
      app.all(
        '/graphql-test',
        createHandler({
          schema,
          context: async (req, params) => /** @type {*} */ (
            TestGraphqlContext.create({
              expressRequest: /** @type {*} */ (req),
              requestParams: params,
              engine: /** @type {*} */ ({}),
              userEntity: null,
              visa: /** @type {*} */ ({}),
            })
          ),
          rootValue: {
            ping: resolve,
          },
        })
      )

      const server = app.listen(0, '127.0.0.1')

      await new Promise(resolve_ => {
        server.once('listening', resolve_)
      })

      const { port } = /** @type {*} */ (server.address())

      const response = await fetch(`http://127.0.0.1:${port}/graphql-test`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(cookieHeader && { cookie: cookieHeader }),
        },
        body: JSON.stringify({ query: '{ ping }' }),
      })

      const received = {
        setCookie: response.headers.getSetCookie(),
        body: await response.json(),
      }

      await new Promise(resolve_ => {
        server.close(resolve_)
      })

      return received
    }

    test('should reach the wire with every attribute intact', async () => {
      const received = await callGraphqlServer({
        resolve: (variables, context) => {
          context.saveRefreshTokenCookie({
            refreshToken: 'refresh-token-0001',
          })

          return 'pong'
        },
      })

      const [cookie] = received.setCookie

      expect(cookie)
        .toContain('test_refresh_token=refresh-token-0001')
      expect(cookie)
        .toContain('HttpOnly')
      expect(cookie)
        .toContain('SameSite=Lax')
      expect(cookie)
        .toContain('Path=/graphql-test')
      expect(cookie)
        .not
        .toContain('Domain=')

      // The response body still arrives: writing a header must not disturb the answer.
      expect(received.body.data.ping)
        .toBe('pong')
    })

    test('should reach the wire when clearing too', async () => {
      const received = await callGraphqlServer({
        resolve: (variables, context) => {
          context.clearRefreshTokenCookie()

          return 'pong'
        },
      })

      const [cookie] = received.setCookie

      // The attributes have to match the ones it was written with, or the browser keeps the
      // original and the session appears to survive a sign-out.
      expect(cookie)
        .toContain('test_refresh_token=;')
      expect(cookie)
        .toContain('Path=/graphql-test')
      expect(cookie)
        .toContain('HttpOnly')
    })

    test('should read the cookie the browser sent', async () => {
      const received = await callGraphqlServer({
        cookieHeader: 'test_refresh_token=incoming-0001; other=1',
        resolve: (variables, context) => context.extractRefreshToken(),
      })

      expect(received.body.data.ping)
        .toBe('incoming-0001')
    })
  })
})
