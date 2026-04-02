# Handoff

这份文档用于给后续开发者或 AI 快速接手项目，避免重复摸索环境和误用官方示例。

## 1. Current Status

截至 `2026-04-02`，以下事项已经完成：

- 仓库路径：`/Users/laysath/proj/hardware-club-exchange`
- GitHub 仓库：`https://github.com/faithleysath/hardware-club-exchange`
- Vercel 项目：`hardware-club-exchange`
- 生产地址：`https://hardware-club-exchange.vercel.app`
- Vercel 已连接 GitHub 仓库
- Supabase 已通过 Vercel Integration 连接到该项目
- 本地已成功执行 `vercel env pull .env.development.local`

## 2. What Already Works

- 一个最小可运行的 `Next.js + Bun` 基线已经存在。
- 首页当前为占位用的 `Hello World` 页面。
- `bun install`、`bun run lint`、`bun run build` 均已验证通过。
- Vercel 生产部署已经成功完成一次。

## 3. Current Stack

- Runtime / package manager：Bun
- App framework：Next.js App Router + TypeScript
- Hosting：Vercel
- Backend platform：Supabase
- Database：Supabase Postgres
- ORM / migrations：Drizzle
- UI：Tailwind CSS + shadcn/ui
- Validation：Zod
- Tests：Vitest + Playwright

## 4. Do Not Do

- 不要把 `.env.development.local`、`.env.local`、service role key 或数据库连接串提交进 Git。
- 不要按 Supabase 官方 quickstart 添加 `notes`、`countries` 等演示表和演示页面。
- 不要在当前阶段引入站内聊天、支付、拍卖或复杂消息系统。
- 不要在还没明确需要前启用 Supabase Preview Branch。
- 不要擅自改动已经确定的技术栈，除非文档先更新并说明原因。

## 5. Recommended Next Steps

1. 读取现有环境变量并确认 Supabase 相关键名。
2. 安装项目所需的 Supabase、Drizzle、Zod、表单和测试依赖。
3. 接入 Supabase Auth，完成登录页、服务端 client 和受保护路由。
4. 定义 Drizzle schema，并创建 `profiles`、`listings`、`listing_images`、`reservation_requests`、`favorites`、`reports`、`audit_logs` 等核心表。
5. 用 SQL migration 或 Supabase SQL Editor 落 RLS 与基础策略。
6. 把首页从占位页替换为平台首页骨架，并建立基础导航。
7. 实现 MVP 主链路：登录 -> 浏览 -> 发布 -> 审核 -> 状态更新。
8. 为核心链路补测试，并在每个阶段做本地验证与 Vercel 预览部署。

## 6. Suggested Build Order

### Step A

基础设施：

- Supabase client 封装
- 环境变量读取与类型保护
- 路由守卫
- 通用页面 layout

### Step B

数据层：

- Drizzle schema
- migration 流程
- seed 方案
- RLS 设计落地

### Step C

功能层：

- Auth
- Profiles
- Listings
- Listing images
- Moderation

### Step D

测试与部署：

- 单元测试覆盖 schema 辅助逻辑与权限判断
- 端到端测试覆盖登录、发布、审核
- Vercel 预览环境 smoke test

## 7. Reading Order For New Contributors

开始开发前建议按这个顺序阅读：

1. `README.md`
2. `docs/PRD.md`
3. `docs/ARCHITECTURE.md`
4. `docs/DATA_MODEL.md`
5. `docs/ROADMAP.md`
6. `docs/OPEN_QUESTIONS.md`

## 8. Verification Commands

- 安装依赖：`bun install`
- 启动开发：`bun run dev`
- 静态检查：`bun run lint`
- 生产构建：`bun run build`

## 9. Notes On External Resources

- GitHub、Vercel、Supabase 三者已经打通，后续开发不应再卡在基础接入上。
- 如果本地缺少环境变量，优先尝试重新执行：`bunx vercel env pull .env.development.local`
- 如果 Vercel 需要重新部署，可继续沿用已有 GitHub 集成或 CLI 部署流程。
