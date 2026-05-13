export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const socketId = body?.socket_id
  const channelName = body?.channel_name

  if (!socketId || !channelName) {
    throw createError({ statusCode: 400, message: '缺少频道认证参数' })
  }

  const character = await useCharacter(event)
  return authorizeChannel(socketId, channelName, character)
})
