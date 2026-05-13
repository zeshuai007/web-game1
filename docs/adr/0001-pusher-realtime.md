# 使用 Pusher 作为实时通信方案

项目需要实时聊天（世界频道、私聊），但当前部署在 Vercel Serverless Functions，不支持 WebSocket 长连接。经过对比多个方案，决定使用 **Pusher** 作为实时通信基础设施。

**拒绝的方案：**
- **WebSocket（Nitro 原生）**：Vercel 不支持，需迁移部署平台（如 Fly.io），代价过大
- **Supabase Realtime**：需将数据库从 Neon 迁移至 Supabase PG，且 Supabase Realtime 使用 WAL 订阅模式，对聊天这种高频场景适配性不如 Pusher
- **SSE + HTTP POST**：服务端推送能力弱（Nitro SSE 在 Vercel 上有连接时长限制），双向通信需分别处理
- **HTTP 短轮询**：延迟高（秒级），无法满足即时聊天体验

**当前约束：**
- Vercel Hobby 免费计划
- Neon Serverless PostgreSQL 免费计划
- Pusher Channels 免费额度：200k 消息/天、100 并发连接，初期用户规模足够

