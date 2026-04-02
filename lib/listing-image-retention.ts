export function resolveRetainedImageIds(params: {
  retainedImageIdsValue: FormDataEntryValue | null;
  currentImageIds: string[];
}) {
  if (params.retainedImageIdsValue === null) {
    return params.currentImageIds;
  }

  const raw = String(params.retainedImageIdsValue).trim();

  if (!raw) {
    return [];
  }

  const validIds = new Set(params.currentImageIds);
  const ids = raw
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0 && validIds.has(value));

  return [...new Set(ids)];
}
