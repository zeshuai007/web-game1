import { alchemyRecipes } from '../../utils/game-engine'

export default defineEventHandler(async () => {
  return { recipes: alchemyRecipes }
})
