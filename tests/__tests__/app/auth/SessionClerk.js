import SessionClerk from '../../../../app/auth/SessionClerk.js'
import SessionCredentialClerk from '../../../../app/auth/SessionCredentialClerk.js'

import CustomerAccessToken from '../../../../sequelize/models/CustomerAccessToken.js'
import CustomerRefreshToken from '../../../../sequelize/models/CustomerRefreshToken.js'

describe('SessionClerk', () => {
  describe('.create()', () => {
    describe('should be an instance of own class', () => {
      const cases = [
        {
          params: {
            AccessTokenModel: /** @type {*} */ ({ tableName: 'fake_access_tokens_0001' }),
            RefreshTokenModel: /** @type {*} */ ({ tableName: 'fake_refresh_tokens_0001' }),
          },
        },
        {
          params: {
            AccessTokenModel: /** @type {*} */ ({ tableName: 'fake_access_tokens_0002' }),
            RefreshTokenModel: /** @type {*} */ ({ tableName: 'fake_refresh_tokens_0002' }),
          },
        },
      ]

      test.each(cases)('AccessTokenModel: $params.AccessTokenModel.tableName', ({ params }) => {
        const actual = SessionClerk.create(params)

        expect(actual)
          .toBeInstanceOf(SessionClerk)
      })
    })

    describe('should keep the injected tables', () => {
      const cases = [
        {
          params: {
            AccessTokenModel: /** @type {*} */ ({ tableName: 'fake_access_tokens_0001' }),
            RefreshTokenModel: /** @type {*} */ ({ tableName: 'fake_refresh_tokens_0001' }),
          },
        },
        {
          params: {
            AccessTokenModel: /** @type {*} */ ({ tableName: 'fake_access_tokens_0002' }),
            RefreshTokenModel: /** @type {*} */ ({ tableName: 'fake_refresh_tokens_0002' }),
          },
        },
      ]

      test.each(cases)('AccessTokenModel: $params.AccessTokenModel.tableName', ({ params }) => {
        const actual = SessionClerk.create(params)

        expect(actual.AccessTokenModel)
          .toBe(params.AccessTokenModel) // same reference
        expect(actual.RefreshTokenModel)
          .toBe(params.RefreshTokenModel) // same reference
      })
    })

    describe('should default the credential clerk', () => {
      const cases = [
        {
          params: {
            AccessTokenModel: CustomerAccessToken,
            RefreshTokenModel: CustomerRefreshToken,
          },
        },
      ]

      test.each(cases)('AccessTokenModel: $params.AccessTokenModel.name', ({ params }) => {
        const actual = SessionClerk.create(params)

        expect(actual.credentialClerk)
          .toBeInstanceOf(SessionCredentialClerk)
      })
    })

    describe('should keep an injected credential clerk', () => {
      const cases = [
        {
          params: {
            AccessTokenModel: /** @type {*} */ ({ tableName: 'fake_access_tokens_0001' }),
            RefreshTokenModel: /** @type {*} */ ({ tableName: 'fake_refresh_tokens_0001' }),
            credentialClerk: /** @type {*} */ ({ tokenByteSize: 111 }),
          },
        },
        {
          params: {
            AccessTokenModel: /** @type {*} */ ({ tableName: 'fake_access_tokens_0002' }),
            RefreshTokenModel: /** @type {*} */ ({ tableName: 'fake_refresh_tokens_0002' }),
            credentialClerk: /** @type {*} */ ({ tokenByteSize: 222 }),
          },
        },
      ]

      test.each(cases)('credentialClerk: $params.credentialClerk.tokenByteSize', ({ params }) => {
        const actual = SessionClerk.create(params)

        expect(actual.credentialClerk)
          .toBe(params.credentialClerk) // same reference
      })
    })
  })
})

describe('SessionClerk', () => {
  describe('#findRefreshTokenEntity()', () => {
    describe('should answer null without touching the table when nothing was presented', () => {
      const cases = [
        { params: { presentedRefreshToken: null } },
        { params: { presentedRefreshToken: '' } },
      ]

      test.each(cases)('presentedRefreshToken: $params.presentedRefreshToken', async ({ params }) => {
        const findOneSpy = jest.spyOn(CustomerRefreshToken, 'findOne')

        const clerk = SessionClerk.create({
          AccessTokenModel: CustomerAccessToken,
          RefreshTokenModel: CustomerRefreshToken,
        })

        const actual = await clerk.findRefreshTokenEntity(params)

        expect(actual)
          .toBeNull()
        expect(findOneSpy)
          .not
          .toHaveBeenCalled()
      })
    })
  })
})
