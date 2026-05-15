import { realmEnum, type Realm } from '../db/schema'

export { realmEnum }
export type { Realm }

export function getMaxLayer(realm: Realm): number {
  return realm === 'condensing_qi' ? 9 : 3
}

export function getNextRealm(current: Realm): Realm | null {
  const idx = realmEnum.indexOf(current)
  if (idx >= realmEnum.length - 1) return null
  return realmEnum[idx + 1]
}

export function isMaxLayer(realm: Realm, layer: number): boolean {
  return layer >= getMaxLayer(realm)
}

function getRealmBoundaryKey(current: Realm): string {
  const next = getNextRealm(current)
  if (!next) return ''
  return `${current}→${next}`
}

export { getRealmBoundaryKey }
