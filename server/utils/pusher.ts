import Pusher from 'pusher'

import { formatRealmTag } from './chat-engine'

const WORLD_CHANNEL = 'presence-world'
const WORLD_EVENT = 'world-message'
const PRIVATE_EVENT = 'private-message'

declare global {
  var __xianniPusher: Pusher | undefined
}

export function getWorldChannelName() {
  return WORLD_CHANNEL
}

export function getWorldEventName() {
  return WORLD_EVENT
}

export function getPrivateEventName() {
  return PRIVATE_EVENT
}

export function getPrivateChannelName(characterId: string) {
  return `private-user-${characterId}`
}

export function isPresenceWorldChannel(channelName: string) {
  return channelName === WORLD_CHANNEL
}

export function isPrivateUserChannel(channelName: string, characterId: string) {
  return channelName === getPrivateChannelName(characterId)
}

export function buildPresenceChannelData(character: { id: string; nickname: string; realm: string; realmLayer: number }) {
  return {
    user_id: character.id,
    user_info: {
      nickname: character.nickname,
      realm: formatRealmTag(character.realm, character.realmLayer),
    },
  }
}

export function usePusherServer() {
  if (!globalThis.__xianniPusher) {
    const config = useRuntimeConfig()
    globalThis.__xianniPusher = new Pusher({
      appId: config.pusherAppId,
      key: config.pusherKey,
      secret: config.pusherSecret,
      cluster: config.pusherCluster,
      useTLS: true,
    })
  }

  return globalThis.__xianniPusher
}

export function isPusherEnabled() {
  return !!useRuntimeConfig().pusherEnabled
}

export function authorizeChannel(socketId: string, channelName: string, character: { id: string; nickname: string; realm: string; realmLayer: number }) {
  const pusher = usePusherServer()

  if (isPresenceWorldChannel(channelName)) {
    return pusher.authorizeChannel(socketId, channelName, buildPresenceChannelData(character))
  }

  if (isPrivateUserChannel(channelName, character.id)) {
    return pusher.authorizeChannel(socketId, channelName)
  }

  throw createError({ statusCode: 403, message: '无权订阅该频道' })
}

export async function publishWorldMessage(data: any) {
  if (!isPusherEnabled()) return
  await usePusherServer().trigger(WORLD_CHANNEL, WORLD_EVENT, data)
}

export async function publishPrivateMessage(characterId: string, data: any) {
  if (!isPusherEnabled()) return
  await usePusherServer().trigger(getPrivateChannelName(characterId), PRIVATE_EVENT, data)
}
