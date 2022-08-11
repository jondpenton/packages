import { Promisable, ValueOf } from 'type-fest'

interface Decision<ConditionKeys extends string, ActionKeys extends string> {
  conditions: { [Key in ConditionKeys]?: boolean }
  actions: { [Key in ActionKeys]?: true }
}

interface DecisionTableOptions<
  ConditionKeys extends string,
  ActionKeys extends string,
> {
  conditions: { [Key in ConditionKeys]: boolean | (() => Promisable<boolean>) }
  actions: { [Key in ActionKeys]: <T>() => Promisable<T> }
  decisions: Decision<ConditionKeys, ActionKeys>[]
}

export class DecisionTable<
  ConditionKeys extends string,
  ActionKeys extends string,
> {
  constructor(
    private options: DecisionTableOptions<ConditionKeys, ActionKeys>,
  ) {}

  public async execute() {
    const decision = await this.getFirstMatchingDecision()
    const actionKeys = Object.keys(decision.actions) as ActionKeys[]
    const actions = actionKeys.reduce(
      (arr, key) => [...arr, this.options.actions[key]],
      [] as ValueOf<
        DecisionTableOptions<ConditionKeys, ActionKeys>['actions']
      >[],
    )

    for (const action of actions) {
      // eslint-disable-next-line no-await-in-loop
      await action()
    }
  }

  private async processConditions(
    keys: ConditionKeys[],
  ): Promise<{ [Key in ConditionKeys]: boolean }> {
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

    const booleanConditions = keys.reduce((obj, key) => {
      return {
        ...obj,
        [key]: conditions[key],
      }
    }, {} as { [Key in ConditionKeys]: boolean })

    return booleanConditions
  }

  private async getFirstMatchingDecision(): Promise<
    Decision<ConditionKeys, ActionKeys>
  > {
    const { decisions } = this.options

    const decisionResults = await Promise.all(
      decisions.map(async (decision) => {
        const conditions = await this.processConditions(
          Object.keys(decision.conditions) as ConditionKeys[],
        )

        for (const condition of Object.entries(conditions)) {
          const [key, value] = condition as [ConditionKeys, boolean]

          if (value !== decision.conditions[key]) {
            return
          }
        }

        return decision
      }),
    )
    const decision = decisionResults.filter(Boolean)[0]

    if (!decision) {
      throw new Error(`Matching decision not found`)
    }

    return decision
  }
}
