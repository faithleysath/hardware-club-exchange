import { publicEnv } from "@/lib/env/public";

type EnvironmentBannerConfig = {
  badge: string;
  className: string;
  message: string;
};

function getEnvironmentBannerConfig(): EnvironmentBannerConfig | null {
  const deploymentEnvironment = process.env.VERCEL_ENV ?? process.env.NODE_ENV;

  if (deploymentEnvironment === "production") {
    return null;
  }

  if (deploymentEnvironment === "preview") {
    const previewDataIsolated =
      publicEnv.NEXT_PUBLIC_PREVIEW_DATA_ISOLATED === "true";

    if (previewDataIsolated) {
      return {
        badge: "Preview",
        className:
          "border-sky-200/80 bg-sky-50/90 text-sky-900 [&_span]:border-sky-300/80 [&_span]:bg-white/80",
        message: "当前为 Preview 部署，已切换到预览数据环境，可用于测试流程验收。",
      };
    }

    return {
      badge: "Preview",
      className:
        "border-amber-200/80 bg-amber-50/95 text-amber-950 [&_span]:border-amber-300/80 [&_span]:bg-white/80",
      message:
        "当前为 Preview 部署，但后端资源尚未声明为隔离环境。请仅使用测试账号与测试数据，避免误操作正式数据。",
    };
  }

  return {
    badge: "Development",
    className:
      "border-zinc-200/80 bg-zinc-100/90 text-zinc-900 [&_span]:border-zinc-300/80 [&_span]:bg-white/80",
    message:
      "当前为本地开发环境。默认应连接预览数据环境，不要直接把本地开发流量打到正式库。",
  };
}

export function EnvironmentBanner() {
  const config = getEnvironmentBannerConfig();

  if (!config) {
    return null;
  }

  return (
    <div className="border-b border-black/5 bg-transparent px-4 py-3 sm:px-6">
      <div
        className={`flex flex-col gap-2 rounded-2xl border px-4 py-3 text-sm shadow-sm sm:flex-row sm:items-center sm:justify-between ${config.className}`}
      >
        <span className="inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
          {config.badge}
        </span>
        <p className="text-sm leading-6">{config.message}</p>
      </div>
    </div>
  );
}
