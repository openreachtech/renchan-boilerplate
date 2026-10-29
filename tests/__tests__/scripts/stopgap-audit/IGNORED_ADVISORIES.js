import IGNORED_ADVISORIES from '../../../../scripts/stopgap-audit/IGNORED_ADVISORIES.js'

describe('IGNORED_ADVISORIES', () => {
  describe('default export', () => {
    describe('when imported', () => {
      test('should be an array', () => {
        const received = IGNORED_ADVISORIES

        expect(received)
          .toBeInstanceOf(Array)
      })
    })
  })
})

describe('IGNORED_ADVISORIES', () => {
  describe('default export', () => {
    describe('should carry a non-empty text in every entry', () => {
      const cases = [
        { input: { key: 'id' } },
        { input: { key: 'package' } },
        { input: { key: 'path' } },
        { input: { key: 'reason' } },
        { input: { key: 'removeWhen' } },
      ]

      test.each(cases)('key: $input.key', ({ input }) => {
        const received = IGNORED_ADVISORIES

        expect.each(received)
          .toHaveProperty(input.key, expect.stringMatching(/\S/u))
      })
    })

    describe('should carry a GHSA id in every entry', () => {
      test('when imported', () => {
        const received = IGNORED_ADVISORIES

        expect.each(received)
          .toHaveProperty('id', expect.stringMatching(/^GHSA(?:-[0-9a-z]{4}){3}$/u))
      })
    })
  })
})

describe('IGNORED_ADVISORIES', () => {
  describe('default export', () => {
    describe('should carry the deepmerge entry', () => {
      test('when imported', () => {
        const expected = {
          id: 'GHSA-gcqx-w48m-w2h4',
          package: 'deepmerge',
          path: 'jest > @jest/core > jest-config > deepmerge',
        }

        const received = IGNORED_ADVISORIES

        expect(received)
          .toContainEqual(expect.objectContaining(expected))
      })
    })
  })
})
