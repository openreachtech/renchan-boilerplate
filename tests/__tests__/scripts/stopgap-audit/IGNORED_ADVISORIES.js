import IGNORED_ADVISORIES from '../../../../scripts/stopgap-audit/IGNORED_ADVISORIES.js'

describe('IGNORED_ADVISORIES', () => {
  describe('default export', () => {
    describe('should be empty', () => {
      test('when no advisory is let through', () => {
        const expected = []

        const received = IGNORED_ADVISORIES

        expect(received)
          .toEqual(expected)
      })
    })
  })
})
