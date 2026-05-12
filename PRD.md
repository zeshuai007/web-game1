# PRD: 仙逆放置修仙 Web 游戏

## Problem Statement

用户希望创建一个古风仙侠题材的 Web 在线放置游戏，参考《仙逆》小说设定，支持用户注册登录。当前已完成了第一期核心功能的构建和测试框架的搭建，需要将当前状态和后续规划明确为统一的 PRD。

## Solution

基于 Vue 3 + Nuxt 4 + Tailwind CSS + PostgreSQL 技术栈的放置修仙 Web 游戏，核心玩法为：挂机积累灵气 → 消耗灵气修炼提升境界 → 炼丹辅助修炼和突破 → 灵石经济循环。用户通过邮箱注册登录，游戏进度保存在服务端。

## User Stories

1. As a 玩家, I want to 使用邮箱注册账号，以便拥有独立的游戏进度
2. As a 玩家, I want to 使用注册的邮箱和密码登录，以便继续之前的游戏
3. As a 玩家, I want to 在修炼页面看到我的角色信息（道号、境界、层数），以便了解当前状态
4. As a 玩家, I want to 看到我的灵气修炼进度条实时更新，以便知道何时可以突破
5. As a 玩家, I want to 看到我的灵石数量，以便规划购买决策
6. As a 玩家, I want to 看到灵气和灵石的产出速率，以便评估修炼效率
7. As a 玩家, I want to 离线后重新上线时自动结算离线收益，以便不浪费离线时间
8. As a 玩家, I want to 灵气攒满后自动突破小层数（凝气期层数、大境界内初期→中期→后期），以便减少重复操作
9. As a 玩家, I want to 在大境界瓶颈处进行概率突破，以便体验修仙突破的成败感
10. As a 玩家, I want to 在突破时使用破境丹提高成功率，以便增加突破策略选择
11. As a 玩家, I want to 突破失败后灵气重置但不损失修为上限，以便降低挫败感
12. As a 玩家, I want to 在丹房查看所有可炼制的丹方，以便了解丹药配方
13. As a 玩家, I want to 收集材料炼制丹药，以便加速修炼或提高突破概率
14. As a 玩家, I want to 在坊市用灵石购买炼丹材料，以便补充炼丹原料
15. As a 玩家, I want to 查看我的背包中的道具和丹药库存，以便管理资源
16. As a 玩家, I want to 在排行榜上查看全服玩家的修为排名，以便了解自己的进度
17. As a 玩家, I want to 随着境界提升看到不同的场景背景，以便获得沉浸式视觉体验
18. As a 玩家, I want to 在登录/注册页看到古风仙山背景，以便进入游戏氛围
19. As a 玩家, I want to 在丹房看到丹炉装饰和古风炼丹场景，以便增强炼丹代入感
20. As a 玩家, I want to 在突破时看到天劫雷云特效背景，以便增强突破仪式感
21. As a 开发者, I want to 有单元测试覆盖游戏引擎核心逻辑，以便确保数值计算正确
22. As a 开发者, I want to 有集成测试覆盖 API 端点，以便确保接口不退化

## Implementation Decisions

### 技术栈
- **前端/全栈框架**: Vue 3 + Nuxt 4 (Nitro 服务端引擎)
- **样式**: Tailwind CSS 3，自定义暗黑古风主题（ink/jade/gold/blood 色系）
- **数据库**: PostgreSQL 18，通过 Drizzle ORM 操作
- **认证**: JWT（jsonwebtoken），bcrypt 密码哈希
- **测试**: Vitest（单元测试 + 集成测试）

### 数据库模型

四张核心表，用户认证与游戏业务解耦：

- **users** — 认证/账户（id, email, password_hash, timestamps）
- **characters** — 角色/游戏数据（user_id → users unique, realm, realm_layer, lingqi, lingqi_cap, lingshi, rates, offline_started_at）
- **inventory** — 背包道具（character_id → characters, item_type/item_id/quantity）
- **alchemy_records** — 炼丹流水日志（character_id, pill_type, quantity, timestamp）

### 境界系统

参考《仙逆》小说设定，共七大境界：

- 凝气期（1-9层）→ 筑基期 → 结丹期 → 元婴期 → 化神期 → 婴变期 → 问鼎期（初/中/后）

突破机制：概率突破，成功率逐级降低（50% → 40% → 30% → 25% → 20% → 15%），可服用破境丹 +20%。失败后灵气进度重置，不损失修为。

### 资源系统
- **灵气**: 修炼进度，挂机自动产出，速率随境界提升
- **灵石**: 基础货币，挂机自动产出，用于购买炼丹材料
- 离线收益上限 24 小时

### 炼丹系统
- 修炼丹（7种）：对应每个境界，加速灵气获取 +20%~50%
- 破境丹（6种）：对应每个大境界突破，+20% 成功率
- 材料用灵石在商店购买，炼丹 100% 成功

### API 架构

使用 Nuxt Nitro 服务端，`server/api/` 目录结构自动注册路由：

- `POST /api/auth/register` — 注册
- `POST /api/auth/login` — 登录
- `GET /api/auth/me` — 获取当前用户和角色信息
- `GET /api/cultivate/progress` — 同步离线收益并返回修炼进度
- `POST /api/cultivate/breakthrough` — 尝试突破
- `GET /api/alchemy/list` — 获取丹方列表
- `POST /api/alchemy/refine` — 炼制丹药
- `GET /api/shop/items` — 获取商品列表
- `POST /api/shop/buy` — 购买商品
- `GET /api/inventory` — 获取背包物品
- `GET /api/rankings` — 获取排行榜

JWT 鉴权中间件拦截 `/api/*` 路由，白名单 `/api/auth/register` 和 `/api/auth/login`。

### 前端路由

- `/` — 登录页
- `/register` — 注册页
- `/cultivate` — 修炼主面板（角色信息 + 修炼进度 + 事件日志）
- `/alchemy` — 丹房（丹方列表 + 炼制操作）
- `/shop` — 坊市（购买材料）
- `/rankings` — 排行榜

### 视觉主题

暗黑水墨古风，ink-950 底色，gold/jade 点缀，blood 警示色。Google Fonts 引入中文字体（ZCOOL QingKe HuangYou 标题 + Noto Serif SC 正文）。生成图片（PNG）用于：页面背景、境界场景、装饰元素、图标。

### 已知的技术决策
- Vue 3 Ref 在模板中的解包：由于 `auth` 是普通对象内嵌 Ref，模板中需要通过顶层变量引用实现自动解包（如 `const c = auth.character`）
- Tailwind JIT 动态类名：通过 `:class` 绑定的动态背景类名需要加入 `safelist` 确保生成
- 使用 `<ClientOnly>` 包裹页面，避免 SSR 环境下 `localStorage` 不可用导致的错误

## Testing Decisions

### 测试原则
- 只测外部行为，不测实现细节
- 单元测试覆盖纯函数逻辑，不依赖外部服务
- 集成测试覆盖 API 端点，对运行中的 dev server 发送真实 HTTP 请求
- 新增功能必须确保 `npm test` 全量通过

### 测试覆盖范围

**单元测试** (`tests/unit/`):
- 游戏引擎纯函数：`getMaxLayer`, `getNextRealm`, `isMaxLayer`, `calcOfflineEarnings`, `breakthroughRoll`, `getPillCultivationBonus`, `getPillBreakthroughBonus`
- 境界配置一致性（数值递增进阶）
- 通过 `vi.mock` 模拟 DB schema 依赖

**集成测试** (`tests/integration/`):
- Auth API：注册（成功/重复/短密码/无效邮箱）、登录（成功/错误密码）、获取用户信息（有token/无token）
- Cultivation API：获取修炼进度、灵气未满时突破失败
- Shop API：商品列表、灵石不足时购买失败
- Alchemy API：丹方列表、材料不足时炼制失败
- Rankings API：排行榜返回

### 前置条件
- 集成测试需要 dev server 在 `localhost:3000` 运行
- 测试数据通过 API 动态创建，不污染生产数据

## Out of Scope

- 实时通信（WebSocket），当前使用轮询（15秒间隔）
- 第三方登录（微信/GitHub OAuth）
- 好友/论道/聊天系统
- 宗门系统
- 炼器系统
- 剧情/奇遇事件
- 手机号注册（需要短信服务）
- E2E 测试（Playwright），计划第二期
- 多角色支持（一人一角）

## Further Notes

- 图片资源由外部 AI 工具（Gemini Imagen）生成，存储在 `public/images/` 目录下，共 17 张 PNG
- 当前仅支持中文界面
- PostgreSQL 使用本地自启动实例（端口 5433），连接字符串通过环境变量 `DB_CONNECTION_STRING` 配置
- JWT 密钥通过环境变量 `JWT_SECRET` 配置，开发环境使用默认值
- 所有境界数据在 `server/utils/game-engine.ts` 集中管理，修改境界参数只需改动该文件
