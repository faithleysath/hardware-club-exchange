import {
  CheckCircle2,
  PauseCircle,
  RotateCcw,
  Send,
  Trash2,
} from "lucide-react";

import { updateListingStatusAction } from "@/lib/actions/listings";
import { getSellerStatusActions } from "@/lib/listing-permissions";
import { SubmitButton } from "@/components/submit-button";
import type { ListingStatus } from "@/lib/constants";

const actionLabelMap = {
  pending_review: {
    label: "提交审核",
    icon: Send,
  },
  published: {
    label: "恢复上架",
    icon: RotateCcw,
  },
  reserved: {
    label: "标记已预订",
    icon: PauseCircle,
  },
  completed: {
    label: "标记已成交",
    icon: CheckCircle2,
  },
  removed: {
    label: "下架",
    icon: Trash2,
  },
} as const;

export function ListingStatusActions({
  listingId,
  status,
}: {
  listingId: string;
  status: ListingStatus;
}) {
  const actions = getSellerStatusActions(status);

  if (actions.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        {status === "pending_review"
          ? "正在等待管理员审核。"
          : "当前状态没有可执行的卖家动作。"}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((nextStatus) => {
        const Icon = actionLabelMap[nextStatus].icon;

        return (
          <form key={nextStatus} action={updateListingStatusAction}>
            <input type="hidden" name="listingId" value={listingId} />
            <input type="hidden" name="nextStatus" value={nextStatus} />
            <SubmitButton variant="secondary" size="sm" pendingLabel="处理中...">
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {actionLabelMap[nextStatus].label}
              </span>
            </SubmitButton>
          </form>
        );
      })}
    </div>
  );
}
