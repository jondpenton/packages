import {
  ClientDelegateKeys,
  createPrismaDelegateProxy,
  Delegate,
  DelegateWhereMap,
} from './utils'

export const createPrismaProxy = <TClient extends Record<string, unknown>>(
  unrestrictedPrisma: TClient,
  delegateMap: DelegateWhereMap<TClient>,
) => {
  type TDelegateMapValue =
    DelegateWhereMap<TClient>[ClientDelegateKeys<TClient>]
  const prismaDelegateProxies = Object.fromEntries(
    Object.entries(delegateMap)
      .filter(
        (
          entry,
        ): entry is [
          ClientDelegateKeys<TClient>,
          Exclude<NonNullable<TDelegateMapValue>, unknown>,
        ] => Boolean(entry[1]),
      )
      .map(([key, where]) => [
        key,
        createPrismaDelegateProxy(
          unrestrictedPrisma[key] as unknown as Delegate,
          where,
        ),
      ]),
  )

  const prisma = new Proxy(unrestrictedPrisma, {
    get(target, propertyKey, receiver) {
      if (propertyKey in prismaDelegateProxies) {
        return Reflect.get(prismaDelegateProxies, propertyKey, receiver)
      }

      return Reflect.get(target, propertyKey, receiver)
    },
  })

  return prisma
}
