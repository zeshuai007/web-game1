/**
 * 生成 PWA 应用图标（从现有修炼珠素材）。
 * 运行：npm run icons
 */
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const SRC = 'public/images/decorations/cultivation-orb.webp'
const OUT_DIR = 'public/images/icons'

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  // 常规图标：全幅缩放
  await sharp(SRC).resize(192, 192).png().toFile(`${OUT_DIR}/pwa-192.png`)
  await sharp(SRC).resize(512, 512).png().toFile(`${OUT_DIR}/pwa-512.png`)

  // Maskable 图标：内容缩至 ~78% 留安全边距，品牌底色填充
  const size = 512
  const inner = await sharp(SRC).resize(400, 400).png().toBuffer()
  await sharp({ create: { width: size, height: size, channels: 4, background: '#0d0a07' } })
    .composite([{ input: inner, gravity: 'centre' }])
    .png()
    .toFile(`${OUT_DIR}/pwa-maskable-512.png`)

  console.log('✓ PWA 图标已生成:', `${OUT_DIR}/pwa-{192,512,maskable-512}.png`)
}

main()
