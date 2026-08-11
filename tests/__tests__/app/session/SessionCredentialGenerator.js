import SessionCredentialGenerator from '../../../../app/session/SessionCredentialGenerator.js'

/**
 * 32 bytes rendered as hex.
 */
const TOKEN_PATTERN = /^[0-9a-f]{64}$/u

describe('SessionCredentialGenerator', () => {
  describe('.create()', () => {
    test('should be an instance of own class', () => {
      const actual = SessionCredentialGenerator.create()

      expect(actual)
        .toBeInstanceOf(SessionCredentialGenerator)
    })

    test('should default to 32 bytes', () => {
      const actual = SessionCredentialGenerator.create()

      expect(actual)
        .toHaveProperty('tokenByteSize', 32)
    })

    describe('with a size handed in', () => {
      const cases = [
        { factoryParams: { tokenByteSize: 16 } },
        { factoryParams: { tokenByteSize: 64 } },
      ]

      test.each(cases)('tokenByteSize: $factoryParams.tokenByteSize', ({ factoryParams }) => {
        const actual = SessionCredentialGenerator.create(factoryParams)

        expect(actual)
          .toHaveProperty('tokenByteSize', factoryParams.tokenByteSize)
      })
    })
  })
})

describe('SessionCredentialGenerator', () => {
  describe('#generateToken()', () => {
    test('should be 32 bytes of hex', () => {
      const actual = SessionCredentialGenerator.create()
        .generateToken()

      expect(actual)
        .toMatch(TOKEN_PATTERN)
      expect(actual)
        .toHaveLength(64)
    })

    test('should not repeat itself', () => {
      const generator = SessionCredentialGenerator.create()

      const tokens = Array.from(
        { length: 1000 },
        () => generator.generateToken()
      )

      expect(new Set(tokens).size)
        .toBe(tokens.length)
    })

    describe('should honour the configured size', () => {
      const cases = [
        { factoryParams: { tokenByteSize: 16 }, expected: 32 },
        { factoryParams: { tokenByteSize: 48 }, expected: 96 },
      ]

      test.each(cases)('tokenByteSize: $factoryParams.tokenByteSize', ({ factoryParams, expected }) => {
        const actual = SessionCredentialGenerator.create(factoryParams)
          .generateToken()

        expect(actual)
          .toHaveLength(expected)
      })
    })
  })
})

describe('SessionCredentialGenerator', () => {
  describe('#generateSessionKey()', () => {
    test('should be unguessable in the same way a token is', () => {
      // Knowing a series key must not let anyone name a series they do not hold.
      const actual = SessionCredentialGenerator.create()
        .generateSessionKey()

      expect(actual)
        .toMatch(TOKEN_PATTERN)
    })
  })
})

describe('SessionCredentialGenerator', () => {
  describe('#hashToken()', () => {
    describe('should answer a SHA-256 digest', () => {
      const cases = [
        { params: { token: 'token-0001' } },
        { params: { token: 'token-0002' } },
      ]

      test.each(cases)('token: $params.token', ({ params }) => {
        const actual = SessionCredentialGenerator.create()
          .hashToken(params)

        expect(actual)
          .toMatch(TOKEN_PATTERN)
      })
    })

    describe('should never answer the token itself', () => {
      // What is stored must not be presentable. A digest that echoed its input would make a
      // database dump a set of working sessions.
      const cases = [
        { params: { token: 'token-0001' } },
        { params: { token: 'token-0002' } },
      ]

      test.each(cases)('token: $params.token', ({ params }) => {
        const actual = SessionCredentialGenerator.create()
          .hashToken(params)

        expect(actual)
          .not
          .toBe(params.token)
        expect(actual)
          .not
          .toContain(params.token)
      })
    })

    test('should answer the same digest for the same token', () => {
      // The lookup hashes what arrives and matches on it, so this has to be stable.
      const generator = SessionCredentialGenerator.create()

      const first = generator.hashToken({ token: 'token-0001' })
      const second = generator.hashToken({ token: 'token-0001' })

      expect(first)
        .toBe(second)
    })

    test('should answer different digests for different tokens', () => {
      const generator = SessionCredentialGenerator.create()

      const first = generator.hashToken({ token: 'token-0001' })
      const second = generator.hashToken({ token: 'token-0002' })

      expect(first)
        .not
        .toBe(second)
    })
  })
})
