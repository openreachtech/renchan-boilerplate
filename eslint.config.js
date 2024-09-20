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
      'jsdoc/check-types': 'off',
      'jsdoc/sort-tags': 'off',
      'jsdoc/valid-types': 'off',
    },
  },
]
