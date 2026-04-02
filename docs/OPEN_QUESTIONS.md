# Open Questions And Defaults

这份文档记录当前已经做出的默认假设、已经确认的产品决策，以及后续仍待你确认的事项。

## Defaults Chosen For Now

- 项目目录名使用 `hardware-club-exchange`。
- 技术栈采用 `Next.js + Bun + Vercel + Supabase + Drizzle + Tailwind + shadcn/ui`。
- 平台定位为社团内部工具，不对外开放。
- 第一版采用 GitHub OAuth + 管理员创建的邮箱密码登录，并保留成员状态审核。
- 第一版采用先审核后公开的内容流转模式。

## Resolved Setup Decisions

- GitHub 仓库已创建并连接到本地仓库。
- Vercel 项目已创建并连接 GitHub。
- Supabase 已通过 Vercel Integration 连接到 `hardware-club-exchange`。
- 本地环境变量已经通过 `vercel env pull` 同步成功。
- 当前不使用 Supabase 官方 quickstart 的演示表和演示页面。
- 若当前平台尚无任何激活管理员，则首个成功登录的账号自动成为 `active admin` 以完成冷启动。

## Confirmed Product Decisions

以下决策已在 `2026-04-02` 确认，可直接作为后续开发默认规则：

### 1. 成员准入方式

- 维持当前方案：成员通过 GitHub OAuth 登录，或由管理员预先创建邮箱密码账号登录。
- 登录后仍由管理员审核成员状态，不额外引入邀请码、邮箱域名自动放行等新入口。

### 2. 交易联系方式

- 第一版继续使用成员资料中的微信号作为默认联系方式。
- 卖家可以在单条闲置中通过 `contact_note` 补充说明联系方式或交接说明。
- 暂不新增 QQ、手机号、飞书等独立字段，先以试运行反馈为准。

### 3. 预约流程强度

- 同一条闲置允许同时存在多个 `pending` 预约申请。
- 卖家默认按申请创建时间顺序处理预约；前一个买家放弃后，可继续联系后续候补。
- 当前实现已经按此规则落地，后续重构也不应把单条闲置限制为“只能存在一个待处理预约”。
- `reserved` / `completed` 由预约处理动作驱动，不再作为卖家在“我的发布”页的手动快捷状态。

## Questions To Confirm Later

### 1. 审核策略

当前默认：新闲置必须审核后公开。

待确认：

- 是否允许管理员信任名单用户免审核
- 是否需要为不同分类设置不同审核强度（当前已支持分类名称、排序和提示语配置）

### 2. 数据保留策略

当前默认：成交记录保留，不物理删除。

待确认：

- 是否需要自动归档超过一定时间的已成交闲置
- 是否允许管理员彻底删除违规数据
