# Hardware Club Exchange

面向硬件社团内部成员的二手闲置交换平台。

## 当前状态

当前目录为项目规划骨架，尚未初始化 Next.js 应用代码。

后续开发默认遵循以下规则：

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
- `docs/OPEN_QUESTIONS.md`：当前默认假设与后续待确认事项

## 默认假设

- 平台只对社团成员开放，不对校内外公开。
- 第一版不做在线支付，不承担担保交易责任。
- 第一版不做站内即时聊天，交易沟通通过预留联系方式完成。
- 第一版启用内容审核，闲置信息默认进入审核后再公开。
- 登录方式以邮箱 Magic Link 或 OTP 为主，成员资格通过管理员审批控制。

## 近期开发顺序

1. 初始化 Next.js 项目、UI 基础设施与 Supabase 连接。
2. 完成登录、成员资料、首页列表和详情页。
3. 完成发布闲置、图片上传、我的发布与编辑能力。
4. 完成管理员审核台、举报处理和审计日志。
5. 完成预约流程、收藏、搜索筛选与可用性优化。
