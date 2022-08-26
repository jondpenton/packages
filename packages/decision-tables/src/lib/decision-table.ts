import type { Promisable, ValueOf } from 'type-fest'

interface Decision<TConditionKeys extends string, TActionKeys extends string> {
  conditions: { [Key in TConditionKeys]?: boolean }
  actions: { [Key in TActionKeys]?: true }
}

interface DecisionTableOptions<
  TConditionKeys extends string,
  TActionKeys extends string,
> {
  conditions: { [Key in TConditionKeys]: boolean | (() => Promisable<boolean>) }
  actions: { [Key in TActionKeys]: <T>() => Promisable<T> }
  decisions: Decision<TConditionKeys, TActionKeys>[]
}

export class DecisionTable<
  TConditionKeys extends string,
  TActionKeys extends string,
> {
  constructor(
    private options: DecisionTableOptions<TConditionKeys, TActionKeys>,
  ) {}

  public async execute() {
    const decision = await this.getFirstMatchingDecision()
    const actionKeys = Object.keys(decision.actions) as TActionKeys[]
    const actions = actionKeys.reduce(
      (arr, key) => [...arr, this.options.actions[key]],
      [] as ValueOf<
        DecisionTableOptions<TConditionKeys, TActionKeys>['actions']
      >[],
    )

    for (const action of actions) {
      // eslint-disable-next-line no-await-in-loop
      await action()
    }
  }

  private async processConditions(
    keys: TConditionKeys[],
  ): Promise<{ [Key in TConditionKeys]: boolean }> {
    const { conditions } = this.options

    const keyResults = await Promise.all(
      keys.map(async (key) => {
        const fnOrBoolean = conditions[key]

        if (typeof fnOrBoolean !== `function`) {
          return
        }

        const fn = fnOrBoolean as Exclude<typeof fnOrBoolean, boolean>

        return {
          key,
          result: await fn(),
        }
      }),
    )

    keyResults
      .filter((keyResult): keyResult is NonNullable<typeof keyResult> =>
        Boolean(keyResult),
      )
      .forEach(({ key, result }) => {
        conditions[key] = result
      })

    const booleanConditions = keys.reduce(
      (obj, key) => ({
        ...obj,
        [key]: conditions[key],
      }),
      {} as { [Key in TConditionKeys]: boolean },
    )

    return booleanConditions
  }

  private async getFirstMatchingDecision(): Promise<
    Decision<TConditionKeys, TActionKeys>
  > {
    const { decisions } = this.options

    const decisionResults = await Promise.all(
      decisions.map(async (decision) => {
        const conditions = await this.processConditions(
          Object.keys(decision.conditions) as TConditionKeys[],
        )

        for (const condition of Object.entries(conditions)) {
          const [key, value] = condition as [TConditionKeys, boolean]

          if (value !== decision.conditions[key]) {
            return
          }
        }

        return decision
      }),
    )
    const [decision] = decisionResults.filter(Boolean)

    if (!decision) {
      throw new Error(`Matching decision not found`)
    }

    return decision
  }
}
