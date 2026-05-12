# PRD: 仙逆放置修仙 Web 游戏 — 第一期完成 + 第二期规划

## Problem Statement

用户希望创建一个古风仙侠题材的 Web 在线放置游戏，参考《仙逆》小说设定，支持用户注册登录。第一期核心功能已全部完成，但存在若干 UX 缺陷需要修复，同时需要规划第二期迭代方向。

## Solution

基于 Vue 3 + Nuxt 4 + Tailwind CSS + PostgreSQL 技术栈的放置修仙 Web 游戏。核心玩法：挂机积累灵气 → 消耗灵气修炼提升境界 → 炼丹辅助修炼和突破 → 灵石经济循环 → 好友论道互助 → 炼器锻造装备。

## User Stories

### 已完成的核心功能

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
24. As a 开发者, I want to 有单元测试覆盖游戏引擎核心逻辑，以便确保数值计算正确
25. As a 开发者, I want to 有集成测试覆盖 API 端点，以便确保接口不退化

### 待修复/优化

26. As a 玩家, I want to 在炼丹页能明显看到破境丹的分类入口，以便知道破境丹在哪里炼制
27. As a 玩家, I want to 在突破弹窗中缺少破境丹时能跳转到炼丹页炼制，以便路径顺畅

### 第二期规划

28. As a 玩家, I want to 加入宗门，完成宗门任务获得贡献值，以便有团队归属感
29. As a 玩家, I want to 参加全服活动（如妖兽入侵），以便有集体目标
30. As a 玩家, I want to 有成就系统记录里程碑，以便有收集成就感

## Implementation Decisions

### 技术栈
- **前端/全栈框架**: Vue 3 + Nuxt 4 (Nitro 服务端引擎)
- **样式**: Tailwind CSS 3，自定义暗黑古风主题（ink/jade/gold/blood 色系）
- **数据库**: PostgreSQL 18，通过 Drizzle ORM 操作
- **认证**: JWT（jsonwebtoken），bcrypt 密码哈希
- **测试**: Vitest（单元测试 + 集成测试）+ Playwright（E2E 测试）

### 数据库模型（6 张核心表）

- **users** — 认证/账户（id, email, password_hash）
- **characters** — 角色/游戏数据（user_id → users, realm, lingqi, lingshi, rates）
- **inventory** — 背包道具（character_id → characters, item_type, item_id, quantity）
- **alchemy_records** — 炼丹流水日志
- **sign_in_records** — 签到记录（character_id, date, consecutive_days）
- **adventure_events** — 奇遇事件记录
- **friend_requests** — 好友关系表（from/to, status: pending/accepted/rejected）
- **dao_records** — 论道记录（每日限制）
- **equipment** — 装备表（character_id, slot, quality, bonus_rates, equipped）

### API 架构（27 个端点）

认证：
- `POST /api/auth/register` | `POST /api/auth/login` | `GET /api/auth/me` | `PUT /api/auth/profile`

修炼：
- `GET /api/cultivate/progress` | `POST /api/cultivate/breakthrough`

商业：
- `GET /api/shop/items` | `POST /api/shop/buy`
- `GET /api/alchemy/list` | `POST /api/alchemy/refine`
- `GET /api/inventory` | `GET /api/rankings`

签到：
- `POST /api/sign-in` | `GET /api/sign-in/status`

奇遇：
- `GET /api/adventure/pending` | `POST /api/adventure/resolve`

好友：
- `POST /api/friends/request` | `POST /api/friends/respond`
- `GET /api/friends/list` | `GET /api/friends/pending`
- `GET /api/friends/search` | `DELETE /api/friends/:id`
- `GET /api/characters/:id`

论道：
- `POST /api/dao/start` | `GET /api/dao/status`

炼器：
- `POST /api/forge/craft` | `POST /api/forge/equip` | `GET /api/forge/inventory`

测试辅助：
- `POST /api/test/char-resource` | `POST /api/sign-in/inject` | `POST /api/adventure/clear`

### 境界系统

七大境界：凝气期（1-9层）→ 筑基期 → 结丹期 → 元婴期 → 化神期 → 婴变期 → 问鼎期（各初/中/后三层）
突破概率：50% → 40% → 30% → 25% → 20% → 15%，破境丹 +20%（上限 90%）

### 炼丹系统

- 修炼丹 7 种（对应每个境界，加速灵气获取 +20%~+50%）
- 破境丹 6 种（对应每个大境界突破，+20% 成功率）
- 材料用灵石在商店购买，炼丹 100% 成功

### 炼器系统

- 5 品品质：凡器 50% → 法器 30% → 宝器 15% → 灵器 4% → 仙器 1%
- 4 栏位：武器、护甲、饰品、法宝
- 属性加成：修炼速度 + 灵石产出，同栏位互斥

### 前端路由

`/`（登录）| `/register`（注册）| `/cultivate`（修炼）| `/friends`（好友）
| `/alchemy`（丹房）| `/forge`（炼器）| `/shop`（坊市）| `/rankings`（排行榜）

### 近期已修复的问题

- **组件注册问题**：`components/game/` 子目录导致 Nuxt 注册带目录前缀（`<GameResourceBar>`），修复后 `defineProps` 未赋值导致 `props is not defined` 崩溃
- **Teleport 崩溃**：`<Teleport to="body">` 在 ClientOnly 环境下 parentNode null 崩溃，移除 Teleport 改用 fixed z-50

## Testing Decisions

### 测试原则
- 只测外部行为，不测实现细节
- 单元测试覆盖纯函数逻辑，不依赖外部服务
- 集成测试覆盖 API 端点，对运行中的 dev server 发送真实 HTTP 请求
- 新增功能必须确保 `npm test` 全量通过

### 测试覆盖
- **单元测试** 30 条：游戏引擎纯函数（境界计算、突破概率、离线收益、丹药加成、炼器品质）
- **集成测试** 41 条：所有 API 端点覆盖（含签到的 4 条、好友论道的 10 条、锻造的 4 条）
- **E2E 测试** 5 条：核心用户旅程（注册、登录、导航、错误场景）

### 测试命令
- `npm test` — 全量单元+集成测试
- `npm run test:e2e` — Playwright E2E 测试（需要 dev server 运行）

## 待优化项

1. 炼丹页增加"修炼丹/破境丹"筛选标签，破境丹以金色高亮
2. 突破弹窗增加"缺少破境丹？前去炼制"跳转链接
3. 修炼页/炼丹页等营养加载状态优化

## Out of Scope

- 实时通信（WebSocket），当前使用轮询（15秒间隔）
- 第三方登录（微信/GitHub OAuth）
- 宗门系统
- 全服活动系统
- 成就系统
- 聊天系统
- E2E 测试 CI 自动化集成

## Further Notes

- 图片资源由 AI 工具生成，存储在 `public/images/`，共 17 张 PNG
- 游戏引擎配置集中在 `server/utils/game-engine.ts`
- 当前 71 条测试全部通过（30 单元 + 41 集成）
- 5 条 Playwright E2E 测试覆盖核心路径
