# PRD: 仙逆放置修仙 Web 游戏 — 完整项目全景

## Problem Statement

用户希望创建一个古风仙侠题材的 Web 在线放置游戏，参考《仙逆》小说设定，支持用户注册登录。当前已建成一个功能完整的放置修仙游戏，正在进行部署上线的最后阶段。

## Solution

基于 Vue 3 + Nuxt 4 + Tailwind CSS + PostgreSQL 技术栈的放置修仙 Web 游戏。核心玩法：挂机积累灵气 → 消耗灵气修炼提升境界 → 炼丹辅助修炼和突破 → 灵石经济循环 → 好友论道互助 → 炼器锻造装备 → 宗门协作 → 成就收集。

## User Stories

### 已完成的核心功能（30 条全部实现）

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
18. As a 玩家, I want to 每日签到获得灵石奖励，连续签到奖励递增，以便获得稳定收入
19. As a 玩家, I want to 修改我的道号，以便随时更改昵称
20. As a 玩家, I want to 修炼时触发随机奇遇事件，以便增加惊喜和策略选择
21. As a 玩家, I want to 添加好友、管理好友请求，以便与朋友互动
22. As a 玩家, I want to 与好友论道每日获得灵气，以便社交互助
23. As a 玩家, I want to 锻造装备、穿戴装备提升修炼效率，以便有长期养成目标
24. As a 玩家, I want to 创建宗门、加入宗门，以便有团队归属感
25. As a 玩家, I want to 完成宗门每日任务获得贡献值，以便为宗门做贡献
26. As a 玩家, I want to 有成就系统记录里程碑，以便有收集成就感
27. As a 玩家, I want to 在炼丹页按类别筛选丹方，以便快速找到需要的丹方
28. As a 玩家, I want to 在突破弹窗中缺少破境丹时能跳转到炼丹页，以便路径顺畅
29. As a 玩家, I want to 页面加载时有骨架屏过渡，以便减少等待焦虑
30. As a 开发者, I want to 有测试覆盖核心逻辑和 API，以便确保功能不退化

## Implementation Decisions

### 技术栈
- **前端/全栈框架**: Vue 3 + Nuxt 4 (Nitro 服务端引擎)
- **样式**: Tailwind CSS 3，自定义暗黑古风主题（ink/jade/gold/blood 色系）
- **数据库**: Neon Serverless PostgreSQL，Drizzle ORM
- **认证**: JWT（jsonwebtoken），bcryptjs 密码哈希
- **部署**: Vercel Serverless Functions
- **测试**: Vitest（单元测试 + 集成测试）+ Playwright（E2E 测试）
- **图片**: WebP 格式（PNG 转换后 44MB → 3MB）

### 数据库模型（15 张表）

**游戏数据（9 张）：**
- `users` — 认证/账户
- `characters` — 角色/游戏数据
- `inventory` — 背包道具
- `alchemy_records` — 炼丹流水日志
- `sign_in_records` — 签到记录
- `adventure_events` — 奇遇事件记录
- `friend_requests` — 好友关系
- `dao_records` — 论道记录
- `equipment` — 装备数据

**宗门（4 张）：**
- `clans` — 宗门
- `clan_members` — 宗门成员
- `clan_tasks` — 宗门每日任务
- `clan_task_progress` — 任务进度

**成就（2 张）：**
- `achievements` — 成就定义
- `character_achievements` — 角色成就记录

**配置表（6 张，迁移中）：**
- `config_realms` — 境界配置
- `config_shop_items` — 商店商品
- `config_forge_recipes` — 锻造配方
- `config_alchemy_recipes` — 炼丹配方
- `config_achievement_defs` — 成就定义
- `config_material_names` — 材料名称

### API 架构（28 个端点 + 测试辅助）

认证：`POST /api/auth/register` | `POST /api/auth/login` | `GET /api/auth/me` | `PUT /api/auth/profile`
修炼：`GET /api/cultivate/progress` | `POST /api/cultivate/breakthrough`
商业：`GET /api/shop/items` | `POST /api/shop/buy` | `GET /api/alchemy/list` | `POST /api/alchemy/refine` | `GET /api/inventory` | `GET /api/rankings`
签到：`POST /api/sign-in` | `GET /api/sign-in/status`
奇遇：`GET /api/adventure/pending` | `POST /api/adventure/resolve`
好友：`POST /api/friends/request` | `POST /api/friends/respond` | `GET /api/friends/list` | `GET /api/friends/pending` | `GET /api/friends/search` | `DELETE /api/friends/:id` | `GET /api/characters/:id`
论道：`POST /api/dao/start` | `GET /api/dao/status`
炼器：`POST /api/forge/craft` | `POST /api/forge/equip` | `GET /api/forge/inventory`
宗门：`POST /api/clan/create` | `GET /api/clan/my` | `POST /api/clan/search` | `POST /api/clan/join` | `POST /api/clan/leave` | `POST /api/clan/kick` | `GET /api/clan/tasks` | `POST /api/clan/task-progress` | `POST /api/clan/task-claim`
成就：`GET /api/achievement/list` | `POST /api/achievement/check` | `POST /api/achievement/claim`
配置：`GET /api/config/game`（新增）

### 境界系统
七大境界：凝气期（1-9层）→ 筑基期 → 结丹期 → 元婴期 → 化神期 → 婴变期 → 问鼎期
突破概率：50% → 40% → 30% → 25% → 20% → 15%，破境丹 +20%

### 前端路由
`/` | `/register` | `/cultivate` | `/friends` | `/alchemy` | `/forge` | `/achievements` | `/shop` | `/rankings`

## 已完成的重构（架构深化）

| # | 改动 | 状态 |
|:-:|------|:----:|
| 1 | 配置数据去重 — 配方单一事实源 | ✅ |
| 2 | 角色获取样板代码消除 | ✅ |
| 3 | 成就检查内联化 | ✅ |
| 4 | 事务支持（drizzle API 兼容暂缓） | ⏸ |
| 5 | game-engine 模块职责拆分 | ✅ |
| 6 | useAuth 重构 | ✅ |

## 已完成的部署适配

- ✅ Neon Serverless PostgreSQL 适配
- ✅ bcrypt → bcryptjs（消除原生依赖）
- ✅ 图片 PNG → WebP（44MB → 3MB）
- ✅ Nitro Vercel preset + 构建配置
- ⏸ 手动部署到 Vercel 控制台（待执行）

## 当前阶段：游戏配置数据迁移到数据库

### 问题
大量游戏配置数据写死在前端/后端代码中，不在数据库里：境界标签、突破概率、丹药配方、商店价格、锻造配方、成就定义、材料名称。

### 方案
新建 6 张配置表 → Seed 脚本初始化 → `GET /api/config/game` 统一 API → 前端 4 个文件删除硬编码 → 后端 5 个 API 端点从 DB 读取。

### Issue 跟踪
- #31 Schema + Seed + Config API
- #32 商店商品 + 炼丹配方迁移
- #33 锻造配方迁移 + 修复前端不显示
- #34 境界配置迁移 + 前端硬编码清理
- #35 成就定义迁移到 DB
- #36 源文件数据残留删除 + 全量回归
- #37 修炼前期体验优化

## 当前阶段：修炼前期体验优化

### Problem Statement

前期修炼节奏偏慢，玩家在凝气期和筑基期容易感到进度反馈不足、突破挫败感偏强，影响开局留存和持续游玩意愿。

### Solution

围绕修炼突破做一轮前期节奏优化，只覆盖凝气期与筑基期，不联动炼丹、锻造、宗门、好友、奇遇等其他系统。

核心方向：
- 缩短首次到筑基的时间感知，目标约 10-15 分钟
- 提高凝气期与筑基期的修炼推进效率
- 失败后保留 50% 当前突破进度
- 引入当前大境界内的连败保底
- 连败保底按每次失败 +5% 线性提升，最高 +20%
- 前期基础突破成功率与保底状态在修炼主面板和突破弹窗中可见
- 该优化全服立即生效

### User Stories

1. As a 玩家, I want to 更快进入第一次筑基突破，以便更快获得开局反馈
2. As a 玩家, I want to 在凝气期感受到更明显的修炼推进，以便知道挂机是有效的
3. As a 玩家, I want to 在筑基期仍然保持顺畅成长，以便不会在首个瓶颈后突然卡住
4. As a 玩家, I want to 在突破失败后保留一部分进度，以便降低挫败感
5. As a 玩家, I want to 看到当前连败次数和保底加成，以便理解自己为什么更容易突破
6. As a 玩家, I want to 在突破弹窗里看到当前成功率与保底状态，以便决定是否尝试突破
7. As a 玩家, I want to 在修炼主面板直接看到前期加成说明，以便随时掌握成长节奏
8. As a 玩家, I want to 看到前期加成同时展示文字和数值，以便更容易理解机制
9. As a 玩家, I want to 仅在修炼突破系统内体验这次优化，以便其他系统保持原有平衡
10. As a 玩家, I want to 所有角色都立即享受这次前期优化，以便新老玩家体验一致

### Implementation Decisions

- 只调整修炼突破链路，不修改炼丹、锻造、宗门、好友、奇遇等系统数值。
- 只覆盖凝气期与筑基期，保持凝气 9 层与筑基初/中/后 3 段结构不变。
- 将前期修炼参数纳入配置管理，避免后续反复调参时修改业务逻辑。
- 前期配置按境界拆分，只为凝气期和筑基期提供单独参数，后续境界沿用现有规则。
- 前期基础参数采用统一前期加成，不做阶段内衰减。
- 突破失败后保留 50% 当前突破进度。
- 当前大境界内维护连败保底状态，成功后清零。
- 连败保底按失败次数线性增长，每失败 1 次成功率 +5%，最高额外 +20%。
- 前期基础突破成功率与保底状态需要同时在修炼主面板和突破弹窗中展示。
- 该优化全服即时生效，不做新角色专属或灰度分流。

### Testing Decisions

- 好的测试应只验证外部行为，不验证内部实现细节。
- 重点测试突破结算规则是否符合新节奏：失败进度保留、连败保底增长、成功后清零、上限封顶。
- 重点测试修炼前期配置是否只影响凝气期与筑基期。
- 重点测试修炼面板和突破弹窗是否正确展示前期加成与保底信息。
- 重点测试其他系统数值不被这次改动影响。
- 现有项目已有 Vitest 单元测试和 API 端点测试作为先例，沿用同类测试风格。

### Out of Scope

- 不调整炼丹、锻造、宗门、好友、成就、奇遇的数值节奏。
- 不修改 24 小时离线收益上限。
- 不引入新的境界结构，不压缩凝气层数或筑基阶段。
- 不做新手引导、任务线或额外教程系统。

### Further Notes

- 这次优化的目标是改善前期体感，不是重做整套修炼系统。
- 该方案适合后续继续迭代参数，但第一版应优先稳定和可解释。

## Testing Decisions

### 测试原则
- 只测外部行为，不测实现细节
- 集成测试覆盖 API 端点，对运行中的 dev server 发送真实 HTTP 请求
- 新增功能必须确保 `npm test` 全量通过

### 测试覆盖
- **集成测试** 84 条：覆盖全部 API 端点
- **E2E 测试** 5 条：核心用户旅程（注册、登录、导航、错误场景）

### 测试命令
- `npm test` — 全量测试
- `npm run test:e2e` — Playwright E2E 测试（需 dev server 运行）

## 当前阶段：聊天系统

### Problem Statement

玩家在修炼页面右侧栏只能看到单向的修炼日志（离线收益、突破结果、签到信息），缺乏玩家间互动。BBS 江湖类游戏的灵魂在于世界公屏聊天和私聊，当前的修炼日志无法承载社交需求，也无法让玩家感受到其他修行者的存在。

### Solution

引入实时聊天系统，将修炼日志中的关键事件（大境界突破）转化为全服广播融入世界频道，新增私聊功能支持离线消息。通过 Pusher 实时通道实现低延迟消息推送，继续使用 Vercel Serverless Functions 免费部署。

### User Stories

1. As a 玩家, I want to 在修炼页面看到世界频道公屏聊天，以便感受到其他修行者的存在
2. As a 玩家, I want to 在世界频道发送消息，以便与其他玩家交流互动
3. As a 玩家, I want to 看到自己的大境界突破自动广播到世界频道，以便分享成就获得祝贺
4. As a 玩家, I want to 看到其他玩家的大境界突破广播，以便感知全服动态
5. As a 玩家, I want to 看到当前在线玩家数量，以便了解服务器活跃度
6. As a 玩家, I want to 在右下角打开私聊浮动窗口，以便与其他玩家私下交流
7. As a 玩家, I want to 私聊消息在离线时保存，上线后可以查看，以便不漏掉重要信息
8. As a 玩家, I want to 收到新的私聊时有未读提醒，以便及时回复
9. As a 玩家, I want to 翻看与某个玩家的历史私聊记录，以便回顾之前的对话
10. As a 玩家, I want to 世界频道发言有境界限制，以便防止小号刷广告
11. As a 玩家, I want to 世界消息不被持久化，刷新即清空，以便保持江湖"喊话"的感觉
12. As a 玩家, I want to 修炼日志的系统事件不再占用独立面板，以便布局更紧凑
13. As a 玩家, I want to 世界频道和私聊在同一区域用 Tab 切换，以便操作便捷
14. As a 玩家, I want to 私有聊天窗口可最小化、可关闭，以便不干扰修炼操作
15. As a 玩家, I want to 聊天在断线后自动重连，以便网络波动不影响体验
16. As a 开发者, I want to 世界消息不落库减少存储压力，以便维持免费部署
17. As a 开发者, I want to 聊天模块与现有游戏轮询分离，以便互不影响

### Implementation Decisions

#### 实时通信方案

- 选用 Pusher Channels（免费额度：200k 消息/天、100 并发连接）作为实时通信基础设施
- Vercel Serverless Functions 不支持 WebSocket 长连接，Pusher 是唯一无需迁移部署平台和数据库的方案
- 其他被拒绝方案：Nitro 原生 WebSocket（Vercel 不支持）、Supabase Realtime（需迁移数据库）、SSE（双向支持弱）
- 详见 ADR `docs/adr/0001-pusher-realtime.md`

#### Pusher 频道设计

- `presence-world`：世界频道，Presence 类型，自动统计在线人数
- `private-user-{characterId}`：私聊频道，Private 类型，只推送给特定用户
- Pusher 认证通过 `POST /api/pusher/auth` 端点，JWT 验证身份后返回签名

#### 聊天数据模型

- 世界频道消息**不持久化**，纯实时广播，前端最多缓存 200 条
- 私聊消息**持久化**到 `chat_messages` 表（from_character_id, to_character_id, content, created_at）
- 私聊不标记已读，通过 `GET /api/chat/unread` 返回未读消息数量和发送者列表
- 私聊历史分页拉取，游标方式，每次 50 条

#### 消息格式

世界频道消息和系统广播共用同一频道，通过 `type` 字段区分：

```typescript
type ChatMessage = {
  type: 'chat' | 'system'
  from?: { id: string; nickname: string }
  content: string
  timestamp: number
  realm?: string  // 发言时角色的境界标签，仅 chat 类型
}
```

格式预留 `action` 类型（后续 PK/交易用），第一期不实现。

#### 系统广播规则

- 只广播**大境界突破**（凝气→筑基、筑基→结丹 等）到世界频道
- 不广播：小境界突破、突破失败、签到、离线收益、炼丹结果
- 广播以 `type: "system"` 格式发送，前端用特殊颜色和前缀「【系统】」渲染
- 广播触发点：`POST /api/cultivate/breakthrough` 成功后调用 Pusher SDK 发送广播
- 原有的修炼日志面板移除，其事件融入系统广播

#### 发言限制

- 世界频道发言需要**凝气期第 3 层**以上
- 单条消息上限 **200 字**
- 前端发送 CD **3 秒**，后端限制同一角色 **10 秒内最多 3 条**世界消息
- 私聊无境界限制

#### 前端模块划分

| 模块 | 类型 | 职责 |
|------|------|------|
| `useChat()` Composable | 状态管理 | Pusher 连接生命周期、世界消息缓冲区（200 条上限）、私聊窗口状态、未读数、断线重连 |
| WorldChat 组件 | UI | 世界频道消息列表 + 发送输入框 + 在线人数显示 + 消息自动滚动 |
| PrivateChatWindow 组件 | UI | 浮动私聊窗口，可最小化/关闭，支持未读提醒闪烁 |
| ChatTabContainer 组件 | UI | 修炼页面右侧的 Tab 容器（世界频道 / 私聊列表） |

#### 布局方案

- 修炼页面右侧栏：上 2/3 保留角色信息 + 突破面板 + 奇遇/签到（可折叠），下 1/3 嵌入 ChatTabContainer
- 私聊浮动窗口挂在 `app.vue` 层级，全局可见，右下角堆叠
- 断线时在聊天区域显示"连接断开，正在重连…"提示条

#### API 端点新增

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/pusher/auth` | Pusher 频道认证 |
| POST | `/api/chat/world` | 发送世界频道消息（触发 Pusher 广播） |
| GET | `/api/chat/private/[peerId]` | 拉取私聊历史（cursor + limit=50） |
| POST | `/api/chat/private/[peerId]` | 发送私聊消息 |
| GET | `/api/chat/unread` | 获取未读私聊消息概况 |

#### 与现有系统的关系

- 游戏数据（灵气、灵石）继续使用 15 秒 HTTP 轮询，不走 Pusher
- 好友关系和宗门关系不做联动修改，私聊对所有人开放
- 突破结算逻辑（`server/utils/cultivation-balance.ts`）增加系统广播副作用

#### 可提取的深层模块

- **`server/utils/chat-engine.ts`**：纯函数模块，封装消息验证（长度、频率、境界检查），可独立单元测试
- **`server/utils/pusher.ts`**：Pusher 频道管理抽象，封装认证签名和消息发布接口

### Testing Decisions

- 好的测试只验证外部行为，不验证 Pusher 内部实现细节
- 单元测试（`tests/unit/chat-engine.test.ts`）：消息验证、限流逻辑、境界检查等纯函数
- 集成测试（`tests/integration/chat.test.ts`）：Pusher 认证端点、私聊发送/拉取 API、世界发言 API（mock Pusher SDK）
- Pusher 实时推送部分需 mock，不做端到端 Pusher 连接测试
- 现有 Vitest 集成测试风格作为先例（`tests/integration/api.test.ts`）

### Out of Scope

- PK 对战系统（消息格式预留 `action` 类型）
- 交易系统
- 宗门频道和好友频道
- 第三方登录
- 全服活动系统
- 修炼日志作为独立面板（已融入世界频道系统广播）
- E2E 测试 CI 自动化集成

## Further Notes

- 部署架构：Neon PostgreSQL + Vercel Serverless Functions
- 图片：WebP 格式，~3MB 总量
- 测试：84 集成测试 + 5 E2E = 89 tests，全部通过
