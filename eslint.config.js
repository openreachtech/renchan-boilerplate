import globals from 'globals'

import {
  default as openreachtechConfig,
  coreRuleOptionHash,
} from '@openreachtech/eslint-config'

export default [
  ...openreachtechConfig,

  {
    ignores: [
      'trials/**',
    ],
  },

  {
    rules: {
      'no-shadow': [
        'error',
        {
          allow: [
            ...coreRuleOptionHash['no-shadow'].allow,
            ...Object.keys(globals.browser),
          ],
        },
      ],
    },
  },

  // Turn off some rules for specific files
  {
    // 🚨 Never add other files to this files.
    files: [
      'server/graphql/AdminGraphqlServerEngine.js',
      'server/graphql/CustomerGraphqlServerEngine.js',
      'server/restfulapi/AppRestfulApiServerEngine.js',
    ],
    rules: {
      'eslint-comments/no-use': 'off',
      'eslint-comments/require-description': 'off',
    },
  },
]
