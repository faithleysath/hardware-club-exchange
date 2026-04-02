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
- MVP 1.0 代码、数据库迁移和测试已经落地

## 2. What Already Works

- Supabase Auth 邮箱 Magic Link 登录已经接入。
- 首位登录用户会自动成为 `active admin`，后续用户默认进入 `pending` 状态。
- 成员端已经具备：首页筛选、详情页、发布、编辑、我的发布、图片上传。
- 管理端已经具备：审核台、成员管理、审计日志。
- Drizzle schema、SQL migration、RLS 策略和私有图片 bucket 已经创建并成功落库。
- `bun run lint`、`bun run test`、`bun run build`、`bun run test:e2e` 均已本地验证通过。

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

1. 进入 Phase 1.1：落预约申请、卖家接受/拒绝、我的预约页。
2. 把 `favorites`、`reports` 的 UI 补齐，形成完整的可用性增强闭环。
3. 增加图片删除/排序和更细的卖家草稿体验。
4. 补更强的端到端测试，包括登录后的发布与审核链路。
5. 根据试运行反馈决定搜索排序、通知占位和运营统计优先级。

## 6. Suggested Build Order

### Step A

已完成：

- Supabase client 封装
- 环境变量读取与类型保护
- 路由守卫与等待审核页
- 通用 layout、导航和管理入口

### Step B

已完成：

- Drizzle schema
- migration 流程
- 私有图片 bucket
- 核心表 RLS 与 `updated_at` 触发器

### Step C

已完成：

- Auth
- Profiles
- Listings
- Listing images
- Moderation
- Audit logs

### Step D

已完成：

- 单元测试覆盖校验与权限判断
- 浏览器 smoke test 覆盖首页与登录页
- 本地 build / lint / Vercel-ready 验证

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
- 单元测试：`bun run test`
- 浏览器 smoke test：`bun run test:e2e`
- 生产构建：`bun run build`

## 9. Notes On External Resources

- GitHub、Vercel、Supabase 三者已经打通，后续开发不应再卡在基础接入上。
- 如果本地缺少环境变量，优先尝试重新执行：`bunx vercel env pull .env.development.local`
- 本地若需要跑 `bun run build`，记得同步一份 `.env.local`，否则 Next.js 不会读取 `.env.development.local`。
- 如果 Vercel 需要重新部署，可继续沿用已有 GitHub 集成或 CLI 部署流程。
