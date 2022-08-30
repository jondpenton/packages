import type { ConditionalKeys } from 'type-fest'

type FindFunction = (args: {
  where?: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    AND?: unknown
  }
}) => unknown

function createPrismaFindOperationProxy<TFunction extends FindFunction>(
  fn: TFunction,
  where: NonNullable<NonNullable<Parameters<TFunction>[0]>[`where`]>,
) {
  return new Proxy(fn, {
    apply(target, thisArg, argArray) {
      let [args] = argArray as [
        {
          where?: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            AND?: unknown
          }
        },
      ]

      if (!args) {
        args = { where }
      } else if (`where` in args && args.where) {
        if (
          Object.keys(args.where).length ===
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            1 &&
          `AND` in args.where
        ) {
          if (Array.isArray(args.where.AND)) {
            args.where.AND = [...args.where.AND, where]
          } else {
            args.where.AND = [args.where.AND, where]
          }
        } else {
          args.where = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            AND: [args.where, where],
          }
        }
      } else {
        args.where = where
      }

      return Reflect.apply(target, thisArg, [args])
    },
  })
}

export interface Delegate {
  aggregate: FindFunction
  count: FindFunction
  findFirst: FindFunction
  findMany: FindFunction
}

function createPrismaFindOperationsProxies<
  TAggregateFunction extends FindFunction,
  TCountFunction extends FindFunction,
  TFindFirstFunction extends FindFunction,
  TFindManyFunction extends FindFunction,
>(
  delegate: {
    aggregate: TAggregateFunction
    count: TCountFunction
    findFirst: TFindFirstFunction
    findMany: TFindManyFunction
  },
  where: NonNullable<
    NonNullable<
      // eslint-disable-next-line no-magic-numbers
      Parameters<TFindFirstFunction>[0]
    >[`where`]
  >,
) {
  return {
    aggregate: createPrismaFindOperationProxy(delegate.aggregate, where),
    count: createPrismaFindOperationProxy(delegate.count, where),
    findFirst: createPrismaFindOperationProxy(delegate.findFirst, where),
    findMany: createPrismaFindOperationProxy(delegate.findMany, where),
  }
}

export function createPrismaDelegateProxy<
  TAggregateFunction extends FindFunction,
  TCountFunction extends FindFunction,
  TFindFirstFunction extends FindFunction,
  TFindManyFunction extends FindFunction,
>(
  delegate: {
    aggregate: TAggregateFunction
    count: TCountFunction
    findFirst: TFindFirstFunction
    findMany: TFindManyFunction
  },
  where: NonNullable<
    NonNullable<
      // eslint-disable-next-line no-magic-numbers
      Parameters<TFindFirstFunction>[0]
    >[`where`]
  >,
) {
  const findProxies = createPrismaFindOperationsProxies(delegate, where)
  const delegateProxy = new Proxy(delegate, {
    get(target, propertyKey, receiver) {
      if (propertyKey in findProxies) {
        return findProxies[propertyKey as keyof typeof findProxies]
      }

      return Reflect.get(target, propertyKey, receiver)
    },
  })

  return delegateProxy
}

export type ClientDelegateKeys<TClient extends Record<string, unknown>> =
  Extract<ConditionalKeys<TClient, Delegate>, string>

export type DelegateWhereMap<TClient extends Record<string, unknown>> = {
  [TKey in ClientDelegateKeys<TClient>]?: TClient[TKey] extends Delegate
    ? NonNullable<
        Parameters<
          TClient[TKey][`findFirst`]
          // eslint-disable-next-line no-magic-numbers
        >[0]
      > extends {
        where?: infer TWhere
      }
      ? TWhere
      : never
    : never
}
