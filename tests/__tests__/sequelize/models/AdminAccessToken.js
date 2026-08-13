import {
  RenchanModel,
} from '@openreachtech/renchan-sequelize'

import SessionCredentialGenerator from '../../../../app/session/SessionCredentialGenerator.js'
import AdminAccessToken from '../../../../sequelize/models/AdminAccessToken.js'

/**
 * An access token is 32 bytes of CSPRNG output rendered as hex.
 */
const ACCESS_TOKEN_PATTERN = /^[0-9a-f]{64}$/u

describe('AdminAccessToken', () => {
  describe('super class', () => {
    test('to be instance of RenchanModel', () => {
      const received = AdminAccessToken.prototype

      expect(received)
        .toBeInstanceOf(RenchanModel)
    })
  })
})

describe('AdminAccessToken', () => {
  describe('.createExpiredAt()', () => {
    describe('to be fifteen minutes after generatedAt', () => {
      const cases = [
        {
          params: {
            generatedAt: new Date('2024-01-21T00:00:01.000Z'),
          },
          expected: new Date('2024-01-21T00:15:01.000Z'),
        },
        {
          params: {
            generatedAt: new Date('2024-01-22T00:00:02.000Z'),
          },
          expected: new Date('2024-01-22T00:15:02.000Z'),
        },
        {
          params: {
            generatedAt: new Date('2024-01-23T23:50:03.000Z'),
          },
          expected: new Date('2024-01-24T00:05:03.000Z'),
        },
      ]

      test.each(cases)('generatedAt: $params.generatedAt', ({
        params,
        expected,
      }) => {
        const received = AdminAccessToken.createExpiredAt(params)

        expect(received)
          .toEqual(expected)
      })
    })
  })
})

describe('AdminAccessToken', () => {
  describe('.generateAccessToken()', () => {
    describe('to be a 64-character hex token', () => {
      test('when called as is', () => {
        const received = AdminAccessToken.generateAccessToken()

        expect(received)
          .toMatch(ACCESS_TOKEN_PATTERN)
      })
    })

    describe('to delegate to the credential generator', () => {
      test('to call factory method of SessionCredentialGenerator', () => {
        const createSpy = jest.spyOn(SessionCredentialGenerator, 'create')

        AdminAccessToken.generateAccessToken()

        expect(createSpy)
          .toHaveBeenCalledWith()
      })
    })
  })
})

describe('AdminAccessToken', () => {
  describe('.buildWithGeneratedAttributes()', () => {
    describe('to be instance of own Model', () => {
      const cases = [
        {
          params: {
            userId: 100001,
            sessionKey: 'session-key-01',
            generatedAt: new Date('2024-01-21T00:00:01.000Z'),
            expiredAt: new Date('2024-01-21T00:15:01.000Z'),
            accessToken: 'accessTOKEN$01',
          },
        },
        {
          params: {
            userId: 100002,
            sessionKey: 'session-key-02',
            generatedAt: new Date('2024-01-22T00:00:02.000Z'),
            // expiredAt: defaults to generatedAt + fifteen minutes
            // accessToken: defaults to a generated 32-byte hex token
          },
        },
      ]

      test.each(cases)('userId: $params.userId', ({
        params,
      }) => {
        const received = AdminAccessToken.buildWithGeneratedAttributes(params)

        expect(received)
          .toBeInstanceOf(AdminAccessToken)
      })
    })

    describe('to call .build() with the admin id stored as AdminId', () => {
      const cases = [
        {
          params: {
            userId: 100001,
            sessionKey: 'session-key-01',
            generatedAt: new Date('2024-01-21T00:00:01.000Z'),
            expiredAt: new Date('2024-01-21T00:15:01.000Z'),
            accessToken: 'accessTOKEN$01',
          },
          expected: {
            AdminId: 100001,
            sessionKey: 'session-key-01',
            generatedAt: new Date('2024-01-21T00:00:01.000Z'),
            expiredAt: new Date('2024-01-21T00:15:01.000Z'),
            accessToken: 'accessTOKEN$01',
          },
        },
        {
          params: {
            userId: 100002,
            sessionKey: 'session-key-02',
            generatedAt: new Date('2024-01-22T00:00:02.000Z'),
            // expiredAt: defaults to generatedAt + fifteen minutes
            // accessToken: defaults to a generated 32-byte hex token
          },
          expected: {
            AdminId: 100002,
            sessionKey: 'session-key-02',
            generatedAt: new Date('2024-01-22T00:00:02.000Z'),
            expiredAt: new Date('2024-01-22T00:15:02.000Z'),
            accessToken: expect.stringMatching(ACCESS_TOKEN_PATTERN),
          },
        },
      ]

      test.each(cases)('userId: $params.userId', ({
        params,
        expected,
      }) => {
        const buildSpy = jest.spyOn(AdminAccessToken, 'build')

        AdminAccessToken.buildWithGeneratedAttributes(params)

        expect(buildSpy)
          .toHaveBeenCalledWith(expected)
      })
    })
  })
})

describe('AdminAccessToken', () => {
  describe('#isExpired()', () => {
    describe('when the token is expired', () => {
      const cases = [
        {
          factoryParams: {
            AdminId: 100001,
            accessToken: 'access-token-100001',
            generatedAt: new Date('2024-01-21T00:00:01.101Z'),
            expiredAt: new Date('2024-01-22T00:00:01.101Z'),
          },
          params: {
            pointsAt: new Date('2024-01-22T00:00:02.101Z'), // after expiredAt
          },
        },
        {
          factoryParams: {
            AdminId: 100002,
            accessToken: 'access-token-100002',
            generatedAt: new Date('2024-02-22T00:00:02.202Z'),
            expiredAt: new Date('2024-02-23T00:00:02.202Z'),
          },
          params: {
            pointsAt: new Date('2024-02-23T00:00:02.202Z'), // = expiredAt
          },
        },
      ]

      test.each(cases)('pointsAt: $params.pointsAt', ({
        factoryParams,
        params,
      }) => {
        const adminAccessToken = AdminAccessToken.build(factoryParams)

        const received = adminAccessToken.isExpired(params)

        expect(received)
          .toBeTruthy()
      })
    })

    describe('when the token is not expired', () => {
      const cases = [
        {
          factoryParams: {
            AdminId: 100003,
            accessToken: 'access-token-100003',
            generatedAt: new Date('2024-01-21T00:00:01.101Z'),
            expiredAt: new Date('2024-01-22T00:00:01.101Z'),
          },
          params: {
            pointsAt: new Date('2024-01-22T00:00:01.100Z'), // just before expiredAt
          },
        },
        {
          factoryParams: {
            AdminId: 100004,
            accessToken: 'access-token-100004',
            generatedAt: new Date('2024-02-22T00:00:02.202Z'),
            expiredAt: new Date('2024-02-23T00:00:02.202Z'),
          },
          params: {
            pointsAt: new Date('2024-02-22T00:00:02.202Z'), // = generatedAt
          },
        },
      ]

      test.each(cases)('pointsAt: $params.pointsAt', ({
        factoryParams,
        params,
      }) => {
        const adminAccessToken = AdminAccessToken.build(factoryParams)

        const received = adminAccessToken.isExpired(params)

        expect(received)
          .toBeFalsy()
      })
    })
  })
})
