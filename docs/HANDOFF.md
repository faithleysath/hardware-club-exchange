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
- Phase 1.1 核心能力已落地：预约申请与处理、我的预约、收藏、举报、举报处理
- 分类管理与图片单张删除 / 重排 / 设封面能力已落地
- 重要：当前 `Preview` 与 `Production` 仍指向同一套 Supabase / Postgres，预览环境尚未数据隔离，详见 `docs/ENVIRONMENTS.md`

## 2. What Already Works

- Supabase Auth GitHub OAuth 登录已经接入。
- 管理员现在可以直接创建邮箱密码账号、重置成员密码，且不开放公开注册。
- 首位登录用户会自动成为 `active admin`，后续用户默认进入 `pending` 状态。
- 成员端已经具备：首页筛选、详情页、发布、编辑、我的发布、图片上传。
- 成员端已经具备：买家预约申请、卖家处理预约、我的预约、我的收藏、详情页举报。
- 发布 / 编辑页已支持草稿保存，以及图片删除、重排、设封面和新增图片追加。
- 管理端已经具备：审核台、成员管理、举报处理、分类管理、审计日志。
- Drizzle schema、SQL migration、RLS 策略和私有图片 bucket 已经创建并成功落库。
- `bun run lint`、`bun run test`、`bun run build` 已在当前代码库验证通过。
- Playwright 端到端用例已补到发布、审核、预约、收藏、举报主链路；运行仍依赖本地 Supabase / Postgres 环境变量与可写测试环境。

认证接入注意事项：

- 代码侧支持 GitHub OAuth，以及管理员受管控创建的邮箱密码账号。
- 邮箱密码账号不能自行注册，只能由管理员在成员管理页创建。
- 在真正可登录前，仍需在 Supabase Dashboard 中启用 GitHub Provider，并录入 GitHub OAuth App 的 `Client ID` / `Client Secret`。
- GitHub OAuth App 的 callback URL 应填写 Supabase 提供的 `https://<project-ref>.supabase.co/auth/v1/callback`。
- Supabase URL Configuration 里的 Redirect URLs 需要加入应用自身的 `/auth/callback`，至少覆盖本地、Preview、Production 三个入口。

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
- 在 Preview 数据环境完成隔离前，不要把 Preview 部署当成独立沙箱来做高风险写操作验证。

## 5. Recommended Next Steps

1. 优化搜索排序、筛选体验和首页发现效率。
2. 继续扩展端到端测试，覆盖图片编辑、分类管理、举报处理等回归场景。
3. 评估站内通知占位、自动归档、运营统计看板的优先级。
4. 推进 Preview / Development / Production 的数据环境隔离。
5. 根据试运行反馈决定是否引入发布模板、信誉标记等运营增强。

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
- Reservations
- Favorites
- Reports
- Category settings
- Moderation
- Audit logs

### Step D

已完成：

- 单元测试覆盖校验、权限判断与图片保留规则
- 浏览器端到端用例已覆盖登录、发布、审核、预约、收藏、举报主路径
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
- 端到端测试：`bun run test:e2e`
- 生产构建：`bun run build`

## 9. Notes On External Resources

- GitHub、Vercel、Supabase 三者已经打通，后续开发不应再卡在基础接入上。
- 如果本地缺少环境变量，优先尝试重新执行：`bunx vercel env pull .env.development.local`
- 本地若需要跑 `bun run build`，记得同步一份 `.env.local`，否则 Next.js 不会读取 `.env.development.local`。
- 如果 Vercel 需要重新部署，可继续沿用已有 GitHub 集成或 CLI 部署流程。
- 如果要继续推进环境治理，优先按 `docs/ENVIRONMENTS.md` 把 Preview / Development 指到独立 Supabase，再考虑把 Preview 当作测试沙箱使用。
