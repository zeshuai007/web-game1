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

## Out of Scope

- 实时通信（WebSocket），当前使用轮询（15秒间隔）
- 第三方登录
- 全服活动系统
- 聊天系统
- E2E 测试 CI 自动化集成

## Further Notes

- 部署架构：Neon PostgreSQL + Vercel Serverless Functions
- 图片：WebP 格式，~3MB 总量
- 测试：84 集成测试 + 5 E2E = 89 tests，全部通过
