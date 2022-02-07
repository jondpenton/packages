type TFindFunction = (args?: {
  where?: {
    AND?: any
  }
}) => any

const createPrismaFindOperationProxy = <TFunction extends TFindFunction>(
  fn: TFunction,
  where: NonNullable<NonNullable<Parameters<TFunction>[0]>[`where`]>
) =>
  new Proxy(fn, {
    apply(target, thisArg, argArray) {
      let [args] = argArray as [
        {
          where?: {
            AND?: any
          }
        }
      ]

      if (args === undefined) {
        args = { where }
      } else if (`where` in args && args.where !== undefined) {
        if (Object.keys(args.where).length === 1 && `AND` in args.where) {
          if (Array.isArray(args.where.AND)) {
            args.where.AND = [...args.where.AND, where]
          } else {
            args.where.AND = [args.where.AND, where]
          }
        } else {
          args.where = {
            AND: [args.where, where],
          }
        }
      } else {
        args.where = where
      }

      return Reflect.apply(target, thisArg, [args])
    },
  })

export interface Delegate {
  findFirst: TFindFunction
  findMany: TFindFunction
}

const createPrismaFindOperationsProxies = <
  TFindFirstFunction extends TFindFunction,
  TFindManyFunction extends TFindFunction
>(
  delegate: {
    findFirst: TFindFirstFunction
    findMany: TFindManyFunction
  },
  where: NonNullable<NonNullable<Parameters<TFindFirstFunction>[0]>[`where`]>
) => ({
  findFirst: createPrismaFindOperationProxy(delegate.findFirst, where),
  findMany: createPrismaFindOperationProxy(delegate.findMany, where),
})

export const createPrismaDelegateProxy = <
  TFindFirstFunction extends TFindFunction,
  TFindManyFunction extends TFindFunction
>(
  delegate: {
    findFirst: TFindFirstFunction
    findMany: TFindManyFunction
  },
  where: NonNullable<NonNullable<Parameters<TFindFirstFunction>[0]>[`where`]>
) => {
  const findProxies = createPrismaFindOperationsProxies(delegate, where)
  const delegateProxy = new Proxy(delegate, {
    get(target, propertyKey, receiver) {
      if (propertyKey === `findFirst`) {
        return findProxies.findFirst
      }

      if (propertyKey === `findMany`) {
        return findProxies.findMany
      }

      return Reflect.get(target, propertyKey, receiver)
    },
  })

  return delegateProxy
}

export type ClientDelegateKeys<TClient extends {}> = {
  [TKey in keyof TClient]: TClient[TKey] extends Delegate
    ? TKey extends string
      ? TKey
      : never
    : never
}[keyof TClient]

export type DelegateWhereMap<TClient extends {}> = {
  [TKey in ClientDelegateKeys<TClient>]?: TClient[TKey] extends Delegate
    ? NonNullable<Parameters<TClient[TKey][`findFirst`]>[0]> extends {
        where?: infer TWhere
      }
      ? TWhere
      : never
    : never
}
