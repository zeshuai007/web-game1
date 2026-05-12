import jwt from 'jsonwebtoken'

export function signToken(payload: { userId: string }) {
  const config = useRuntimeConfig()
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  const config = useRuntimeConfig()
  return jwt.verify(token, config.jwtSecret) as { userId: string }
}
