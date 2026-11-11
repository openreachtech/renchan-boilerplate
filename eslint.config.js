import globals from 'globals'

import {
  default as openreachtechConfig,
  coreRuleOptionHash,
} from '@openreachtech/eslint-config'

export default [
  ...openreachtechConfig,

  {
    ignores: [
      './dist/**',
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

  {
    files: [
      'tests/**/*.js',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        // There are 0 or more rest parameters in the array
        // string | { selector: string, message: string }
        ...coreRuleOptionHash['no-restricted-syntax'].spreadOptions
          .filter(it => it.selector !== 'ClassDeclaration[superClass=null]:not(:has(MethodDefinition[kind=constructor])), ClassDeclaration[superClass=null]:has(MethodDefinition[kind=constructor]):not(:has(MethodDefinition[kind=constructor] AssignmentExpression[left.object.type=ThisExpression]))'), // Kick out `Do not declare static class`
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
