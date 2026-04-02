# Open Questions And Defaults

这份文档记录当前已经做出的默认假设，以及后续需要你确认的事项。

## Defaults Chosen For Now

- 项目目录名使用 `hardware-club-exchange`。
- 技术栈采用 `Next.js + Bun + Vercel + Supabase + Drizzle + Tailwind + shadcn/ui`。
- 平台定位为社团内部工具，不对外开放。
- 第一版采用邮箱登录 + 成员状态审核。
- 第一版采用先审核后公开的内容流转模式。

## Resolved Setup Decisions

- GitHub 仓库已创建并连接到本地仓库。
- Vercel 项目已创建并连接 GitHub。
- Supabase 已通过 Vercel Integration 连接到 `hardware-club-exchange`。
- 本地环境变量已经通过 `vercel env pull` 同步成功。
- 当前不使用 Supabase 官方 quickstart 的演示表和演示页面。
- 若当前平台尚无任何激活管理员，则首个成功登录的账号自动成为 `active admin` 以完成冷启动。

## Questions To Confirm Later

### 1. 成员准入方式

当前默认：管理员审核成员状态。

备选方向：

- 仅允许指定邮箱域名自动通过
- 使用邀请码
- 先注册后由管理员手工批准

### 2. 交易联系方式

当前默认：成员资料中维护微信号，闲置发布时可补充说明。

待确认：

- 是否还需要 QQ、手机号、飞书等字段
- 是否允许卖家在单条闲置里隐藏主联系方式

### 3. 预约流程强度

当前默认：买家可发起预约，卖家手动接受或拒绝。

待确认：

- 是否需要限流，避免同一用户频繁骚扰
- 是否允许一个闲置同时存在多个待处理预约

### 4. 审核策略

当前默认：新闲置必须审核后公开。

待确认：

- 是否允许管理员信任名单用户免审核
- 是否需要为不同分类设置不同审核强度

### 5. 数据保留策略

当前默认：成交记录保留，不物理删除。

待确认：

- 是否需要自动归档超过一定时间的已成交闲置
- 是否允许管理员彻底删除违规数据
