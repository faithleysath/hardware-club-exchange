import type { z } from "zod";

export type ActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors: Record<string, string>;
};

export const initialActionState: ActionState = {
  status: "idle",
  fieldErrors: {},
};

export function getFieldErrors(error: z.ZodError) {
  const flattened = error.flatten().fieldErrors;
  const entries = Object.entries(flattened) as Array<[string, string[] | undefined]>;

  return Object.fromEntries(
    entries
      .filter((entry): entry is [string, string[]] => Array.isArray(entry[1]) && entry[1].length > 0)
      .map(([field, messages]) => [field, messages[0] ?? "输入有误"]),
  );
}
