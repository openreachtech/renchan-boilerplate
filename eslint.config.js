import openreachtechConfig from '@openreachtech/eslint-config'

export default [
  ...openreachtechConfig,

  {
    ignores: [
      'trials/**',
    ],
  },

  {
    languageOptions: {
      sourceType: 'module',
      globals: {
        __dirname: 'readonly',
        process: 'readonly',
        crypto: 'readonly',

        module: 'readonly',

        sequelize: 'readonly', // namespace

        setTimeout: 'readonly',
      },
    },
  },

  {
    files: [
      '**/*.cjs',
    ],
    languageOptions: {
      sourceType: 'commonjs',
    },
  },

  // Turn off some rules temporary
  {
    rules: {
      camelcase: 'off',
      'no-shadow': 'off',
      'sort-imports': 'off',

      'jest/require-top-level-describe': 'off',

      'jsdoc/check-tag-names': 'off',
      'jsdoc/no-undefined-types': 'off',
      'jsdoc/valid-types': 'off',

      'openreachtech/no-unexpected-multiline': 'off',
    },
  },
]
