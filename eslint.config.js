'use strict'

const openreachtechConfig = require('@openreachtech/eslint-config')

module.exports = [
  ...openreachtechConfig,

  {
    ignores: [
      'trials/**',
    ],
  },

  {
    languageOptions: {
      globals: {
        __dirname: 'readonly',
      },
    },
  },

  // Turn off some rules temporary
  {
    rules: {
      '@stylistic/arrow-parens': 'off',
      '@stylistic/comma-dangle': 'off',
      '@stylistic/newline-per-chained-call': 'off',

      'jest/no-alias-methods': 'off',

      'jsdoc/check-types': 'off',
      'jsdoc/sort-tags': 'off',
      'jsdoc/valid-types': 'off',
    },
  },
]
