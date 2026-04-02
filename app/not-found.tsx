import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl rounded-[2.5rem] border border-black/5 bg-white p-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.06)]">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-400">
        404
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950">
        这条内容不存在，或者你暂时没有权限查看
      </h1>
      <p className="mt-4 text-sm leading-7 text-zinc-500">
        如果这是一个待审核或已下架的闲置，请先确认自己是否为发布者或管理员。
      </p>
      <Link href="/" className={`${buttonVariants({ size: "md" })} mt-6`}>
        返回首页
      </Link>
    </div>
  );
}
