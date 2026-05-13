export default defineNitroPlugin(() => {
  if (!useRuntimeConfig().pusherEnabled) return
  usePusherServer()
})
