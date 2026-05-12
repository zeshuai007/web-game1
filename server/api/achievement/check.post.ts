import { checkAchievements } from '../../utils/achievement-engine'

export default defineEventHandler(async (event) => {
  const { eventType, realm } = await readBody(event) || {}
  const completed = await checkAchievements(event, eventType, realm)
  return { completed }
})
