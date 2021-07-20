import { Promisable, ValueOf } from 'type-fest'

interface Decision<ConditionKeys extends string, ActionKeys extends string> {
  conditions: { [Key in ConditionKeys]?: boolean }
  actions: { [Key in ActionKeys]?: true }
}

interface DecisionTableOptions<
  ConditionKeys extends string,
  ActionKeys extends string
> {
  conditions: { [Key in ConditionKeys]: boolean | (() => Promisable<boolean>) }
  actions: { [Key in ActionKeys]: <T>() => Promisable<T> }
  decisions: Decision<ConditionKeys, ActionKeys>[]
  executeActionsConcurrently?: true
}

export class DecisionTable<
  ConditionKeys extends string,
  ActionKeys extends string
> {
  constructor(
    private options: DecisionTableOptions<ConditionKeys, ActionKeys>
  ) {}

  public async execute() {
    const decision = await this.getFirstMatchingDecision()
    const actionKeys = Object.keys(decision.actions) as ActionKeys[]
    const actions = actionKeys.reduce(
      (arr, key) => [...arr, this.options.actions[key]],
      [] as ValueOf<
        DecisionTableOptions<ConditionKeys, ActionKeys>['actions']
      >[]
    )

    for (const action of actions) {
      await action()
    }
  }

  private async processConditions(
    keys: ConditionKeys[]
  ): Promise<{ [Key in ConditionKeys]: boolean }> {
    const { conditions } = this.options

    for (const key of keys) {
      const fnOrBoolean = conditions[key]

      if (typeof fnOrBoolean !== `function`) {
        continue
      }

      const fn = fnOrBoolean as Exclude<typeof fnOrBoolean, boolean>

      const result: boolean = await fn()

      conditions[key] = result
    }

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

    decisionLoop: for (const decision of decisions) {
      const conditions = await this.processConditions(
        Object.keys(decision.conditions) as ConditionKeys[]
      )

      for (const condition of Object.entries(conditions)) {
        const [key, value] = condition as [ConditionKeys, boolean]

        if (value !== decision.conditions[key]) {
          continue decisionLoop
        }
      }

      return decision
    }

    throw new Error(`Matching decision not found`)
  }
}
