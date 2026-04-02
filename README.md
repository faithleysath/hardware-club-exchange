# Hardware Club Exchange

面向硬件社团内部成员的二手闲置交换平台。

## 当前状态

当前目录已经包含可运行的内部试运行版 Web 应用、数据库迁移、测试基线和交接文档，可直接用于社团内部验证。

截至 `2026-04-02`，项目外部资源已经完成首轮打通：

- GitHub 仓库已连接：`https://github.com/faithleysath/hardware-club-exchange`
- Vercel 项目已创建并连接 GitHub
- 线上基线已发布：`https://hardware-club-exchange.vercel.app`
- Supabase 已通过 Vercel Integration 连接到项目
- 本地开发环境已执行过 `vercel env pull .env.development.local`
- 当前 `Preview` 与 `Production` 仍共用同一套 Supabase / Postgres，预览地址独立但数据未隔离，详见 `docs/ENVIRONMENTS.md`

当前版本已完成的能力：

- Supabase Auth GitHub OAuth 登录与会话恢复
- 管理员受管控创建邮箱密码账号、重置成员密码，且不开放公开注册
- 成员资料建档、待审核状态页与管理员成员激活
- 闲置发布、草稿保存、编辑、图片上传、列表浏览、详情页与我的发布
- 编辑闲置时支持图片单张删除、重排、设封面和新增图片追加
- 买家预约申请、卖家在“我的预约”页接受 / 拒绝 / 释放候补 / 关闭成交
- 我的预约页、我的收藏页、详情页收藏与举报入口、管理员举报处理页
- 分类管理页，可配置分类名称、描述、发布建议、排序和启停状态
- 管理员审核台、成员管理页与审计日志页
- Drizzle schema、SQL migration、核心 RLS 策略与私有图片 bucket
- Vitest 单测、本地 lint 与 production build 已验证通过
- Playwright 已补到发布、审核、预约、收藏、举报主链路，运行依赖本地 Supabase / Postgres 环境变量

登录接入说明：

- 当前支持两种入口：GitHub OAuth，以及管理员预先创建的邮箱密码账号。
- 邮箱密码账号不开放公开注册，只能由管理员在成员管理页创建。
- 首次启用前，需要在 Supabase `Authentication -> Sign In / Providers -> GitHub` 中启用 GitHub Provider。
- GitHub OAuth App 的回调地址应使用 Supabase 提供的 `https://<project-ref>.supabase.co/auth/v1/callback`。
- 同时要在 Supabase 的 Redirect URLs 中加入当前应用地址的 `/auth/callback`，至少包含本地、Preview 和 Production。

后续开发仍默认遵循以下规则：

- 先更新文档，再改需求边界。
- 先完成 MVP，再考虑扩展能力。
- 优先保证内部可用、可审核、可维护，而不是功能堆叠。

## 目标

- 为社团成员提供统一的闲置发布、浏览、预约和成交入口。
- 将交易场景从分散的群聊消息中抽离出来，提升可搜索性和可追踪性。
- 通过最小审核与权限控制，把平台限定为社团内部工具。

## 推荐技术栈

- 前端框架：Next.js App Router + TypeScript
- 部署平台：Vercel
- 后端能力：Supabase
- 数据库：Supabase Postgres
- 鉴权：Supabase Auth
- 文件存储：Supabase Storage
- 数据访问：Drizzle ORM + SQL migration
- UI：Tailwind CSS + shadcn/ui
- 表单与校验：React Hook Form + Zod
- 测试：Vitest + Playwright

## 文档索引

- `docs/PRD.md`：产品需求文档，定义目标、范围、用户故事与验收标准
- `docs/ARCHITECTURE.md`：技术架构、模块边界、部署与安全方案
- `docs/DATA_MODEL.md`：核心表结构、状态流转与访问控制设计
- `docs/ROADMAP.md`：里程碑、阶段范围与实施顺序
- `docs/HANDOFF.md`：当前项目状态、外部资源接入情况、下一阶段开工顺序
- `docs/ENVIRONMENTS.md`：Vercel Preview / Production 与 Supabase 数据环境边界
- `docs/OPEN_QUESTIONS.md`：当前默认假设与后续待确认事项

## 默认假设

- 平台只对社团成员开放，不对校内外公开。
- 第一版不做在线支付，不承担担保交易责任。
- 第一版不做站内即时聊天，交易沟通通过预留联系方式完成。
- 第一版启用内容审核，闲置信息默认进入审核后再公开。
- 登录方式以 GitHub OAuth 和管理员创建的邮箱密码账号为主，成员资格通过管理员审批控制。
- 若当前平台还没有任何激活管理员，则首个成功登录的账号自动成为 `active admin`，用于完成初始引导。

## 下一阶段建议

1. 强化搜索排序和筛选体验，提升首页发现效率。
2. 继续扩展端到端验证，覆盖图片编辑、分类管理和举报处理等回归点。
3. 评估站内通知占位、自动归档和运营统计看板的优先级。
4. 推进 Preview / Production 的数据环境隔离，减少试运行风险。
5. 根据试运行反馈决定是否引入发布模板、信誉标记等运营增强。

## 本地开发

- 安装依赖：`bun install`
- 启动开发环境：`bun run dev`
- 运行检查：`bun run lint`
- 运行单测：`bun run test`
- 运行端到端测试：`bun run test:e2e`
- 生产构建：`bun run build`

说明：

- `.env.example` 列出了应用运行真正依赖的最小环境变量集合。
- 本地若已执行 `vercel env pull .env.development.local`，建议额外同步一份到 `.env.local` 供 `next build` 使用。
- `.env.local` 和 `.env.development.local` 都不要提交进 Git。
- 在完成环境隔离前，Preview 部署只能用于界面和流程验收，不应视为独立测试数据库。

## 开发约束

- 不要把 `.env.development.local`、`.env.local` 或任何密钥提交进 Git。
- 不要照搬 Supabase 官方 quickstart 里的 `notes` 或 `countries` 示例表到本项目。
- 不要在尚未需要前启用 Supabase Preview Branch。
- 在 `Preview` 与 `Production` 未完成数据库隔离前，不要在 Preview 上做真实审核、真实上架或其他高风险写操作。
