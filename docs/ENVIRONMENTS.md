# Environments

这份文档专门说明 Vercel 部署环境和 Supabase/Postgres 数据环境的边界，避免把“预览 URL 独立”误解成“预览数据已隔离”。

## 1. Current Reality

截至 `2026-04-02`，当前项目的真实状态是：

- Vercel 已启用 `Production`、`Preview`、`Development` 三个环境作用域。
- `main` 会触发生产部署，分支和 PR 会触发预览部署。
- 但当前 `Preview` 与 `Production` 指向的是同一套 Supabase / Postgres 资源。
- 这意味着当前预览环境只是“部署地址隔离”，不是“数据环境隔离”。

已核对到的结果：

- `NEXT_PUBLIC_SUPABASE_URL`：`Preview` 与 `Production` 相同。
- `POSTGRES_HOST`：`Preview` 与 `Production` 相同。
- `POSTGRES_DATABASE`：`Preview` 与 `Production` 相同。

在完成隔离前，所有预览部署都必须按“会写到正式后端”来对待。

## 2. Target Topology

推荐的目标拓扑如下：

| Layer | Production | Preview | Development |
|------|------|------|------|
| Vercel deployment | `main` 对应生产域名 | 分支 / PR 对应 preview URL | 本地 `bun run dev` |
| Supabase project | 正式项目 | 独立 preview 项目 | 默认连 preview 项目 |
| Postgres data | 正式数据 | 测试数据 | 测试数据 |
| Auth users | 正式成员账号 | 测试账号 | 测试账号 |
| Storage bucket | 正式图片 | 测试图片 | 测试图片 |

一句话原则：

- `Production` 面向真实使用。
- `Preview` 面向 UI 验收和业务回归。
- `Development` 默认跟 `Preview` 站在同一套测试后端，不要直接连正式库。

## 3. Required Variables

应用代码当前硬性依赖这些变量：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `POSTGRES_URL`
- `POSTGRES_URL_NON_POOLING`，建议为 migration 保留

仓库中的 `.env.example` 只保留了这组最小必需变量。

额外约定：

- `NEXT_PUBLIC_PREVIEW_DATA_ISOLATED`
  仅用于前端提示，默认值应为 `false`。
  只有在确认 `Preview` 已切到独立 Supabase / Postgres 后，才把它改成 `true`。

如果继续沿用 Vercel 的 Supabase Integration，还应保证同一环境里的整组 Supabase 变量保持一致，包括但不限于：

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`

## 4. Isolation Rollout

要把当前项目从“共享正式后端的 preview”切到“真正隔离的 preview”，按下面顺序执行：

1. 新建一个独立的 Supabase preview 项目。
2. 把当前仓库的数据库迁移跑到 preview 项目上。
3. 确认 preview 项目已生成 `listing-images` bucket、RLS 和触发器。
4. 在 Vercel 中把 `Preview` 和 `Development` 作用域的数据库与 Supabase 变量改成 preview 项目。
5. 保持 `Production` 作用域继续指向正式项目，不要混写。
6. 把 `NEXT_PUBLIC_PREVIEW_DATA_ISOLATED` 在 `Preview` 作用域改成 `true`。
7. 推一个新 commit 或手动重部署 Preview，确认页面提示从“共享数据警告”变成“已切换到预览数据环境”。

## 5. Suggested Commands

查看当前项目有哪些环境变量：

```bash
bunx vercel env ls
```

把 Preview 环境拉到本地：

```bash
bunx vercel env pull .env.local --environment=preview --yes
```

把 Production 环境拉到单独文件做对比：

```bash
bunx vercel env pull .env.production.local --environment=production --yes
```

完成 preview 资源准备后，可以按变量逐个写入：

```bash
echo "https://your-preview-project.supabase.co" | bunx vercel env add NEXT_PUBLIC_SUPABASE_URL preview
echo "your-preview-anon-key" | bunx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
echo "your-preview-service-role" | bunx vercel env add SUPABASE_SERVICE_ROLE_KEY preview
echo "your-preview-postgres-url" | bunx vercel env add POSTGRES_URL preview
echo "your-preview-postgres-url" | bunx vercel env add POSTGRES_URL_NON_POOLING preview
echo "true" | bunx vercel env add NEXT_PUBLIC_PREVIEW_DATA_ISOLATED preview
```

如果希望本地开发也默认落到 preview 数据环境，再把同一组变量同步到 `development` 作用域。

## 6. Migration Notes

本仓库的迁移入口是：

```bash
bun run db:migrate
```

执行前要先确认本地拉到的是目标环境变量。

- 迁移 preview 库前，先执行 `bunx vercel env pull .env.local --environment=preview --yes`
- 迁移生产库前，务必再次确认是生产窗口，并尽量单独使用 `.env.production.local`

当前 `drizzle/0000_fat_wild_child.sql` 已经覆盖：

- 业务表结构
- 索引
- `updated_at` 触发器
- `listing-images` bucket
- RLS 策略

因此 preview 项目不需要手工补这些基础对象。

## 7. Operational Rules

- 在 preview 未隔离前，不要把 preview 当成沙箱。
- 在 preview 未隔离前，不要用真实成员账号做脏写测试。
- 本地开发默认应连接 preview 数据环境，而不是生产环境。
- 不要把 `.env.local`、`.env.development.local`、`.env.production.local` 提交进 Git。
- 只有在确认 preview 和 production 使用不同的 Supabase/Postgres 后，才可以把 preview 用于高风险写操作验证。
