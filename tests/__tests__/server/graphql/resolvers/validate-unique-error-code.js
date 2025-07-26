import {
  GraphqlResolversLoader,
} from '@openreachtech/renchan'

import rootPath from '../../../../../app/globals/root-path.js'

describe('validate-unique-error-code', () => {
  describe('to be unique', () => {
    const cases = [
      {
        params: {
          poolPath: rootPath.to('server/graphql/resolvers/customer/actual/'),
        },
      },
      {
        params: {
          poolPath: rootPath.to('server/graphql/resolvers/admin/actual/'),
        },
      },
    ]

    test.each(cases)('poolPath: $params.poolPath', async ({ params }) => {
      const loader = GraphqlResolversLoader.create(params)

      const resolvers = await loader.loadResolvers()

      const allErrorCodes = resolvers
        .flatMap(it =>
          Object.values(it.errorCodeHash)
        )
        .toSorted(
          (alpha, beta) =>
            alpha.localeCompare(beta)
        )

      const uniqueErrorCodes = [...new Set(allErrorCodes)]

      expect(allErrorCodes)
        .toEqual(uniqueErrorCodes)
    })
  })
})
