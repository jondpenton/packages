import { DecisionTable } from './decision-table'

describe(`DecisionTable`, () => {
  describe(`#execute`, () => {
    it(`when all conditions met, executes actions`, async () => {
      const fn = jest.fn()
      const fn2 = jest.fn()
      const decisionTable = new DecisionTable({
        actions: {
          fn,
          fn2,
        },
        conditions: {
          first: true,
          second: false,
        },
        decisions: [
          {
            actions: {
              fn: true,
              fn2: true,
            },
            conditions: {
              first: true,
            },
          },
        ],
      })

      await decisionTable.execute()

      expect(fn).toHaveBeenCalledTimes(
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        1,
      )
      expect(fn2).toHaveBeenCalledTimes(
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        1,
      )
    })
  })
})
