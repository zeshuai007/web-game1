# 仙逆放置修仙 - 生图提示词文档

> 将每张图的英文提示词复制到 Gemini Imagen 生成，图片下载后放入对应目录

---

## 📁 目录结构

```
public/images/
├── backgrounds/       # 页面背景图 (1920×1080)
│   ├── login-bg.webp
│   ├── cultivate-bg.webp
│   ├── alchemy-bg.webp
│   ├── shop-bg.webp
│   ├── rankings-bg.webp
│   ├── tribulation-bg.webp
│   └── realms/         # 七大境界独立背景
│       ├── realm-1-condensing.webp
│       ├── realm-2-foundation.webp
│       ├── realm-3-core.webp
│       ├── realm-4-nascent.webp
│       ├── realm-5-deity.webp
│       ├── realm-6-nascent-trans.webp
│       └── realm-7-seeking.webp
├── decorations/       # 装饰图 (512×512)
│   ├── cauldron.webp
│   ├── breakthrough-circle.webp
│   └── pill-glow.webp
└── icons/             # 图标 (128×128)
    ├── lingqi-icon.webp
    └── lingshi-icon.webp
```

---

## 🖼 1. 页面背景图

### 1.1 登录/注册背景 — 仙山云海

中文：水墨风格修仙仙境，远处仙山层叠，云雾缭绕，金色霞光从云缝中射出，画面底部有古松枝桠剪影，整体暗色调，神秘而庄严。1920×1080 横版。

**English prompt (paste into Gemini):**
> Ink wash painting style, dark fantasy Chinese xianxia landscape, towering celestial mountains fading into misty clouds, golden divine light piercing through dark storm clouds, ancient pine tree silhouettes at the bottom, jade-green and gold accents against deep almost-black background, ethereal atmosphere, mysterious and solemn, epic wide landscape 1920x1080, cinematic lighting, low saturation with selective gold highlights, mist and cloud layers

**→ 保存为 `public/images/backgrounds/login-bg.webp`**

---

### 1.2 修炼主面板背景 — 修仙洞府

中文：幽深的山洞内部，石壁上有青色灵光符文闪烁，中央有蒲团和石台，洞外透入幽蓝月光，石缝中长出灵芝仙草。暗色调但带神秘光感。

**English prompt:**
> Dark cultivation cave interior, xianxia style, deep indigo shadows, glowing cyan rune symbols on stone walls, a woven straw meditation cushion on a stone platform, moonlight streaming through cave opening, luminous glowing herbs and fungi growing from rock crevices, an ancient bronze incense burner with thin spiral of golden smoke, mysterious atmosphere, low-key lighting with cool blue and jade highlights, cinematic, 1920x1080

**→ 保存为 `public/images/backgrounds/cultivate-bg.webp`**

---

### 1.3 丹房背景 — 古鼎丹炉

中文：古风炼丹房，中央一尊三足青铜丹炉，炉身刻有古老符文，炉底有青色火焰燃烧，周围有药架、葫芦、草药，墙壁昏暗，光线来自炉火。暖色温。

**English prompt:**
> Ancient Chinese alchemy chamber, dark xianxia style, center focus on a large bronze tripod cauldron with ancient seal script carvings, cyan-green spirit flame burning beneath the cauldron, wooden shelves with ceramic jars and dried herbs hanging from ceiling, gourds and scrolls scattered around, warm amber and jade-green fire light as main illumination, deep shadows in corners, smoke swirling upward, cinematic lighting, dramatic contrast, 1920x1080

**→ 保存为 `public/images/backgrounds/alchemy-bg.webp`**

---

### 1.4 坊市背景 — 古风街市

中文：修仙坊市夜景，古风街道两旁挂满灯笼发出暖光，地摊上摆放各种灵材玉石，修士剪影在摊位前，远处有巨大古建筑，天空深蓝带星。

**English prompt:**
> Night scene of a xianxia cultivation marketplace street, ancient Chinese architecture with upturned eaves, warm orange glowing paper lanterns hanging in rows, street stalls displaying glowing spirit stones and herbs, silhouettes of cultivators browsing, a grand ancient pagoda in the distance, deep blue night sky with faint stars, warm amber light contrasting with cool shadows, bustling yet mysterious atmosphere, cinematic wide shot, 1920x1080

**→ 保存为 `public/images/backgrounds/shop-bg.webp`**

---

### 1.5 排行榜背景 — 天榜石碑

中文：高耸入云的巨大古老石碑，碑身刻满金色发光文字（排名），石碑立于悬崖之巅，背后是云海和黎明曙光。极简构图。

**English prompt:**
> A colossal ancient stone stele, like Celestial Ranking Stele, towering above clouds on a mountain peak, xianxia dark fantasy style, golden glowing ancient characters carved into the dark stone surface, misty sea of clouds below, first light of dawn on the horizon, dramatic vertical composition, the stele fills the frame left side, empty sky on right, majestic and awe-inspiring, cinematic lighting, 1920x1080

**→ 保存为 `public/images/backgrounds/rankings-bg.webp`**

---

### 1.6 突破弹窗背景 — 天劫雷云

中文：黑色漩涡云层中金色雷电交织，云缝中降下天劫光柱，天地变色，压迫感强。适合作为突破弹窗的底层背景。

**English prompt:**
> Dark apocalyptic sky, massive swirling black storm clouds with a vortex opening at center, golden lightning bolts forking in all directions, a pillar of heavenly tribulation light descending from the vortex, mountains silhouetted below, intense atmosphere of judgment and power, dark blue-black with electric gold, dramatic and fearful, epic wide landscape, 1920x1080

**→ 保存为 `public/images/backgrounds/tribulation-bg.webp`**

---

## 🌌 2. 七大境界背景

### 2.1 凝气期 — 薄雾山径

中文：清晨薄雾中的青石山路，两侧是竹林和灵草，微弱的灵气光点漂浮在空气中，淡绿色调，清新又神秘。

**English prompt:**
> Xianxia cultivation realm: Condensing Qi stage, misty mountain path at dawn, green mossy stone steps winding through bamboo forest, faint floating spirit light particles in the air, soft jade-green and pale gold atmosphere, ground covered in glowing spiritual herbs, peaceful yet mysterious, morning mist layers, low saturation cinematic style, 1920x1080

**→ 保存为 `public/images/backgrounds/realms/realm-1-condensing.webp`**

---

### 2.2 筑基期 — 宗门庭院

中文：古老修仙宗门的青石庭院，巨大的香炉飘出青烟，四周有古木和石碑，月满中天，银辉洒地，淡黄色调。

**English prompt:**
> Xianxia foundation establishment stage scene, ancient sect courtyard at midnight, full moon casting silver light, a large stone incense burner with thin smoke rising, weathered stone tablets and ancient trees surrounding the courtyard, warm yellow lantern light from paper windows of hall behind, pale yellow and silver color palette, peaceful and dignified, cinematic atmospheric, 1920x1080

**→ 保存为 `public/images/backgrounds/realms/realm-2-foundation.webp`**

---

### 2.3 结丹期 — 金丹炉火

中文：密室中一枚金丹悬空旋转，周围有火焰形灵气环绕，壁上有阵法图纹发出暗金色光，整个空间被丹火映成金色调。

**English prompt:**
> Core formation realm, underground cultivation chamber, a floating golden core pill spinning slowly in mid-air, surrounded by swirling flame-shaped spiritual energy, circular array formations glowing on the stone floor and walls in dark gold, intense warm firelight casting dramatic shadows, golden and amber color scheme, sacred and intense atmosphere, cinematic 1920x1080

**→ 保存为 `public/images/backgrounds/realms/realm-3-core.webp`**

---

### 2.4 元婴期 — 元婴出窍

中文：冥想中的修士头顶浮现发光的小人（元婴），灵光四射，周围紫蓝色灵力漩涡，空间扭曲感。

**English prompt:**
> Nascent Soul realm, a meditating cultivator silhouette, a glowing miniature humanoid figure (nascent soul) emerging above the head, radiating brilliant violet-blue spiritual light, swirling energy vortex around, cosmic particles floating in the air, the space seems to warp with spiritual pressure, purple-blue and jade color scheme, otherworldly mystical atmosphere, cinematic 1920x1080

**→ 保存为 `public/images/backgrounds/realms/realm-4-nascent.webp`**

---

### 2.5 化神期 — 元神化形

中文：修士元神化作巨大法相立于身后，金光万丈，天地共鸣，云层被光穿透形成光柱，辉煌壮丽。

**English prompt:**
> Deity Transformation realm, a cultivator's primordial spirit manifesting as a giant ethereal avatar behind the physical body, golden divine light radiating outward in beams, heaven and earth resonating, clouds pierced by pillars of celestial light, majestic and transcendent, warm gold-white color scheme, epic scale, cinematic lighting, 1920x1080

**→ 保存为 `public/images/backgrounds/realms/realm-5-deity.webp`**

---

### 2.6 婴变期 — 浴火重生

中文：火焰漩涡中的重生场景，旧躯壳碎裂，新生的灵体从火焰中浮现，红金配色，涅槃感，强烈的明暗对比。

**English prompt:**
> Nascent Transformation realm, phoenix-like rebirth scene, a figure emerging from a swirling vortex of crimson and gold flames, fragments of old shell falling away, luminous new spiritual body being forged, intense fire and heat, dramatic chiaroscuro, red-orange-gold color scheme, powerful transformative energy, cinematic, epic dark fantasy xianxia style, 1920x1080

**→ 保存为 `public/images/backgrounds/realms/realm-6-nascent-trans.webp`**

---

### 2.7 问鼎期 — 绝顶问天

中文：修士独立于世界之巅，脚下云海翻涌，头顶星空银河旋转，一人面对苍天，极致的孤独与力量感。

**English prompt:**
> Seeking Heaven realm, a lone cultivator standing at the peak of the highest mountain, above the clouds, the vast galaxy and starry cosmos swirling overhead, feeling of transcending mortality, deep blue to gold gradient sky, sea of clouds below, the figure is small against the immense cosmos but radiates inner light, ultimate solitude and power, epic climax cinematic, 1920x1080

**→ 保存为 `public/images/backgrounds/seeking-bg.webp`**

---

## 🏛 5. 新增页面背景图

### 5.1 宗门背景 — 仙门重地

中文：宏伟的修仙宗门入口，巨大的石质山门刻有精致的龙形浮纹，背后是层叠的仙山，远处可见弟子行走的身影，云雾缭绕。暗色水墨风格，带金色和青色点缀。

**English prompt:**
> Grand entrance of a xianxia cultivation sect, massive stone gate with intricate dragon carvings, towering mountains in the background, disciples walking in distance, ethereal mist, dark ink wash style with gold and jade highlights, cinematic lighting, 1920x1080

**→ 保存为 `public/images/backgrounds/clan-bg.webp`**

---

### 5.2 成就背景 — 仙藏宝库

中文：宏伟的仙家典籍库，无数发光的玉简悬浮在虚空中，古老的书架和宝物错落有致，星光从穹顶落下。神圣而庄严，深蓝与金色调。

**English prompt:**
> Celestial archive hall, rows of glowing jade tablets floating in a cosmic void, ancient scrolls and artifacts on dark wooden shelves, starlight filtering through a glass ceiling, majestic and divine atmosphere, dark blue and gold color scheme, xianxia fantasy style, 1920x1080

**→ 保存为 `public/images/backgrounds/achievements-bg.webp`**

---

### 5.3 炼器背景 — 灵火锻台

中文：修仙界的炼器工坊，中心是发光的锻台和巨大的铁锤，石炉中燃烧着青蓝色的灵火，墙上挂着神兵利器，火星四溅。高对比度，强明暗。

**English prompt:**
> A magical blacksmith's forge in a xianxia world, center focus on a glowing anvil and a massive hammer, intense blue and orange spirit flames burning in a stone furnace, weapons and armor hanging on walls, sparks flying, high contrast, dramatic shadows, cinematic lighting, 1920x1080

**→ 保存为 `public/images/backgrounds/forge-bg.webp`**

---

### 5.4 好友背景 — 浮空茶亭

中文：浮空岛上的宁静茶亭，古色古香，石桌上摆着茶具，四周樱花盛开，脚下是翻滚的云海，远处有仙岛剪影。社交氛围，光线柔和。

**English prompt:**
> A peaceful outdoor tea pavilion on a floating mountain island, xianxia style, stone table with tea set, cherry blossom trees in bloom, overlooking a sea of clouds, distant silhouettes of other islands, serene and social atmosphere, soft sunlight, pale pink and jade-green tones, 1920x1080

**→ 保存为 `public/images/backgrounds/friends-bg.webp`**


---

## 🏺 3. 装饰图

### 3.1 丹炉装饰

中文：三足青铜丹炉特写，炉身刻有云雷纹和古老铭文，炉盖缝隙透出青色丹光，精致细节。

**English prompt:**
> Close-up of an ancient Chinese bronze tripod cauldron for alchemy, intricate cloud-thunder patterns and ancient seal script engraved on surface, cyan-green glow leaking from the lid cracks, three legs with beast-face motifs, dark background with dramatic rim lighting on the bronze texture, highly detailed texture, game item icon style, transparent background, 512x512

**→ 保存为 `public/images/decorations/cauldron.webp`**

---

### 3.2 突破符文圈

中文：金色圆形阵法图，符文环绕旋转，中心有太极阴阳图，发光效果，适合作为突破按钮背景。

**English prompt:**
> Circular golden array formation glowing in the dark, concentric rings of ancient runic characters rotating, yin-yang taiji symbol at the center, intricate geometric patterns, radiant golden light emanating outward, magical circle for breakthrough/ascension, transparent background, game UI element style, 512x512

**→ 保存为 `public/images/decorations/breakthrough-circle.webp`**

---

### 3.3 丹药光晕

中文：丹药悬浮发光效果，淡青色/金色光晕，半透明，适合作为丹药图标的装饰。

**English prompt:**
> Glowing pill orb, translucent jade-green to gold gradient, soft luminous halo, floating magical elixir droplet with inner light, sparkle particles, subtle energy swirl, transparent background, game item decoration style, 512x512

**→ 保存为 `public/images/decorations/pill-glow.webp`**

---

## 💎 4. 图标

### 4.1 灵气图标

中文：青绿色光团/气旋，内有灵光核心，柔光效果，代表"灵气"。

**English prompt:**
> Game icon for "Spiritual Energy", a swirling jade-green luminous orb with a bright core, soft glow effect, mist-like tendrils swirling around, transparent background, clean game UI icon style, minimal but magical, 128x128

**→ 保存为 `public/images/icons/lingqi-icon.webp`**

---

### 4.2 灵石图标

中文：淡蓝色/白色的灵石原矿，棱角分明，内部透光，微微发光，代表货币"灵石"。

**English prompt:**
> Game icon for "Spirit Stone", a raw translucent crystal ore with angular facets, pale blue-white inner glow, floating with tiny sparkle particles, transparent background, clean game currency icon style, 128x128

**→ 保存为 `public/images/icons/lingshi-icon.webp`**
