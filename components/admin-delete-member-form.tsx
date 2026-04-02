"use client";

import { useActionState } from "react";

import { initialActionState } from "@/lib/actions/shared";
import { SubmitButton } from "@/components/submit-button";
import type { deleteMemberAction } from "@/lib/actions/admin";

type DeleteMemberAction = typeof deleteMemberAction;

export function AdminDeleteMemberForm({
  memberId,
  displayName,
  email,
  action,
  disabledReason,
}: {
  memberId: string;
  displayName: string;
  email: string | null;
  action: DeleteMemberAction;
  disabledReason?: string;
}) {
  const [state, formAction] = useActionState(action, initialActionState);

  if (disabledReason) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 p-4 text-sm leading-7 text-zinc-500">
        {disabledReason}
      </div>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `确认删除 ${displayName}${email ? `（${email}）` : ""} 吗？这会同时删除对方的账号、资料、闲置记录以及相关预约/收藏/举报，且不能恢复。`,
          )
        ) {
          event.preventDefault();
        }
      }}
      className="space-y-4 rounded-2xl border border-red-200 bg-red-50/70 p-4"
    >
      <input type="hidden" name="memberId" value={memberId} />

      <div className="space-y-1">
        <p className="text-sm font-medium text-red-800">删除成员</p>
        <p className="text-xs leading-6 text-red-700/90">
          这是不可恢复的硬删除，会一起移除登录账号、资料、名下闲置以及相关互动记录。
        </p>
      </div>

      {state.message ? (
        <p
          className={`rounded-2xl border px-4 py-3 text-sm ${
            state.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-white text-red-700"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <SubmitButton pendingLabel="删除中..." variant="danger" size="sm">
        删除成员
      </SubmitButton>
    </form>
  );
}
