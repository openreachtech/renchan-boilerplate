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
      globals: {
        __dirname: 'readonly',
      },
    },
  },
]
