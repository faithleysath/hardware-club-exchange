import Link from "next/link";
import {
  ClipboardCheck,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { redirect } from "next/navigation";

import { ListingCard } from "@/components/listing-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  getHomePageData,
  parseMarketplaceFilters,
} from "@/lib/data/listings";
import {
  listingConditionOptions,
  memberRoleLabels,
} from "@/lib/constants";
import {
  getActiveCategorySettings,
  getCategoryLabelMap,
} from "@/lib/data/categories";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const filters = await parseMarketplaceFilters(searchParams);
  const [homePageData, activeCategories, categoryLabelMap] = await Promise.all([
    getHomePageData(filters),
    getActiveCategorySettings(),
    getCategoryLabelMap(),
  ]);
  const { viewer, listings, stats } = homePageData;

  if (viewer && viewer.status !== "active") {
    redirect("/waiting-approval");
  }

  if (!viewer) {
    return <MarketingLanding />;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2.5rem] border border-black/5 bg-zinc-950 px-8 py-10 text-white shadow-[0_30px_100px_rgba(0,0,0,0.16)] sm:px-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <Badge className="bg-white/10 text-white" tone="neutral">
              {memberRoleLabels[viewer.role]}控制台
            </Badge>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                欢迎回来，{viewer.displayName}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-zinc-300">
                现在可以浏览社团内部正在流转的闲置，或者把自己的设备快速送审上架。
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="上架中闲置" value={String(stats.liveListings)} />
            <StatCard label="我待处理的条目" value={String(stats.waitingOnMe)} />
            <StatCard label="可用入口" value={viewer.role === "admin" ? "成员 + 管理" : "成员"} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6 rounded-[2rem] border border-black/5 bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,0.05)]">
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-500">筛选条件</p>
            <h2 className="text-2xl font-semibold text-zinc-950">缩小范围，直接找到需要的设备</h2>
          </div>

          <form className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-800" htmlFor="q">
                关键词
              </label>
              <Input id="q" name="q" defaultValue={filters.q ?? ""} placeholder="型号、关键词、描述" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-800" htmlFor="category">
                分类
              </label>
              <Select id="category" name="category" defaultValue={filters.category ?? ""}>
                <option value="">全部分类</option>
                {activeCategories.map((option) => (
                  <option key={option.category} value={option.category}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-800" htmlFor="condition">
                成色
              </label>
              <Select id="condition" name="condition" defaultValue={filters.condition ?? ""}>
                <option value="">全部成色</option>
                {listingConditionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-800" htmlFor="maxPrice">
                最高价格（元）
              </label>
              <Input
                id="maxPrice"
                name="maxPrice"
                inputMode="decimal"
                defaultValue={
                  typeof filters.maxPriceCents === "number"
                    ? String(filters.maxPriceCents / 100)
                    : ""
                }
                placeholder="例如 500"
              />
            </div>

            <div className="flex gap-3">
              <button className={buttonVariants({ size: "md" })} type="submit">
                应用筛选
              </button>
              <Link href="/" className={buttonVariants({ variant: "secondary", size: "md" })}>
                清空
              </Link>
            </div>
          </form>

          <div className="rounded-[1.5rem] bg-amber-50 p-5">
            <p className="text-sm font-medium text-amber-900">下一步建议</p>
            <p className="mt-2 text-sm leading-7 text-amber-800">
              如果你刚开始使用平台，先补齐个人资料中的微信号，再发布闲置会更顺。
            </p>
            <Link
              href="/me/profile"
              className={`${buttonVariants({ variant: "secondary", size: "sm" })} mt-4`}
            >
              去完善资料
            </Link>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-[2rem] border border-black/5 bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,0.05)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">发现区</p>
              <h2 className="text-2xl font-semibold text-zinc-950">
                当前可浏览的闲置
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/publish" className={buttonVariants({ size: "sm" })}>
                发布闲置
              </Link>
              <Link href="/me/listings" className={buttonVariants({ variant: "secondary", size: "sm" })}>
                管理我的发布
              </Link>
              {viewer.role === "admin" ? (
                <Link href="/admin/review" className={buttonVariants({ variant: "secondary", size: "sm" })}>
                  打开审核台
                </Link>
              ) : null}
            </div>
          </div>

          {listings.length > 0 ? (
            <div className="grid gap-6 xl:grid-cols-2">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={{
                    ...listing,
                    categoryLabel: categoryLabelMap[listing.category],
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white/70 p-10 text-center shadow-[0_18px_60px_rgba(0,0,0,0.03)]">
              <h3 className="text-2xl font-semibold text-zinc-950">暂时没有符合条件的闲置</h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-zinc-500">
                可以放宽筛选条件，或者自己先发布第一条。平台会在审核通过后自动出现在这里。
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/" className={buttonVariants({ variant: "secondary" })}>
                  重置筛选
                </Link>
                <Link href="/publish" className={buttonVariants({ size: "md" })}>
                  去发布
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function MarketingLanding() {
  const features = [
    {
      icon: Search,
      title: "集中浏览",
      description: "把散落在群聊里的闲置整理成可搜索、可筛选的清单。",
    },
    {
      icon: Upload,
      title: "发布更规范",
      description: "统一标题、描述、图片和联系方式，减少来回解释成本。",
    },
    {
      icon: ClipboardCheck,
      title: "审核可追踪",
      description: "成员资格、发布审核和下架原因都能留痕，方便社团管理。",
    },
    {
      icon: ShieldCheck,
      title: "仅内部开放",
      description: "只有激活成员才能进入详情和真实数据页，默认不对外公开。",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-6 rounded-[2.8rem] border border-black/5 bg-white/85 p-8 shadow-[0_30px_100px_rgba(0,0,0,0.08)] lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
        <div className="space-y-6">
          <Badge tone="warning">MVP 1.0 已可投入内部试运行</Badge>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
              硬件社团的闲置流转，终于不用再靠翻聊天记录。
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-zinc-600">
              Hardware Club Exchange 把登录、发布、图片、审核和状态更新放到一个统一入口里，
              让成员更快找到东西，也让管理员更容易兜底。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/login" className={buttonVariants({ size: "md" })}>
              成员登录
            </Link>
            <a
              href="#how-it-works"
              className={buttonVariants({ variant: "secondary", size: "md" })}
            >
              了解流程
            </a>
          </div>
        </div>

        <div className="rounded-[2.2rem] bg-zinc-950 p-6 text-white">
          <div className="mb-6 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-amber-300" />
            <p className="text-sm font-medium text-zinc-200">平台原则</p>
          </div>
          <div className="space-y-4 text-sm leading-7 text-zinc-300">
            <p>1. 只面向社团内部成员开放。</p>
            <p>2. 第一版不做支付、不做站内聊天、不做公开市场。</p>
            <p>3. 所有新闲置先审核后公开，管理动作有审计记录。</p>
            <p>4. 成员可使用 GitHub，或管理员预先创建的邮箱密码账号登录。</p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <article
              key={feature.title}
              className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,0.05)]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-900">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-950">{feature.title}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-600">{feature.description}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/6 px-5 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}
