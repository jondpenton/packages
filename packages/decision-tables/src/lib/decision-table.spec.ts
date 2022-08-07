import { DecisionTable } from './decision-table'

describe(`DecisionTable`, () => {
  describe(`#execute`, () => {
    it(`when all conditions met, executes actions`, async () => {
      const fn = jest.fn()
      const fn2 = jest.fn()
      const decisionTable = new DecisionTable({
        conditions: {
          first: true,
          second: false,
        },
        actions: {
          fn,
          fn2,
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

      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn2).toHaveBeenCalledTimes(1)
    })
  })
})
