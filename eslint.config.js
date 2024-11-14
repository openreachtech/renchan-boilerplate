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
]
