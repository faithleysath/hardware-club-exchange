# Roadmap

## Phase 0: Project Foundation

目标：完成可开发的基础设施和工程约束。

当前状态：

- 已完成最小可运行的 Next.js 基线。
- 已完成首次 Vercel 生产部署。
- 已完成 Supabase 与 Vercel 项目连接。

交付项：

- 初始化 Next.js App Router 项目
- 接入 Tailwind CSS、shadcn/ui、Zod、Drizzle
- 创建 Supabase 项目并配置 Auth、Storage 和 Postgres
- 建立基础 layout、导航和受保护路由方案
- 建立 lint、format、test 基线

下一步重点：

- 接入真实的 Supabase Auth
- 引入 Drizzle 与迁移流程
- 建立首页和登录后的应用骨架

## Phase 1: MVP

目标：实现一个可被社团内部真实使用的最小交换平台。

交付项：

- 邮箱登录和成员状态控制
- 闲置列表页和详情页
- 发布闲置、编辑闲置、上传多图
- 我的发布页
- 管理员审核台
- 闲置状态切换：待审核、已发布、已预订、已成交、已下架
- 基础搜索和筛选

说明：

- Phase 1 中的 `已预订` 由卖家手动设置，用于先满足最小可用流程。
- 正式的买家预约申请、卖家接受或拒绝等完整流程，放在 Phase 1.1。

上线门槛：

- 成员无法访问未授权数据
- 普通成员无法修改他人内容
- 图片上传、发布、审核流程可完整走通
- 关键页面可在手机端正常使用

## Phase 1.1: Usability Upgrade

目标：把平台从“能用”提升到“值得持续用”。

交付项：

- 预约申请流程
- 我的预约页
- 收藏能力
- 举报能力
- 审计日志查询基础界面

## Phase 2: Operational Refinement

目标：减少管理员负担，提高搜索和沉淀能力。

交付项：

- 更强的搜索排序和筛选体验
- 自动归档历史成交闲置
- 运营统计看板
- 成员信誉或历史成交标记
- 可配置的发布模板和分类管理

## Explicitly Deferred

- 站内聊天
- 在线支付
- 物流托管
- 多租户能力
- 对外公开访问
