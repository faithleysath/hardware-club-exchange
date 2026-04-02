import { describe, expect, it } from "vitest";

import { resolveRetainedImageIds } from "@/lib/listing-image-retention";

describe("resolveRetainedImageIds", () => {
  it("keeps all current images when the retention field is missing", () => {
    expect(
      resolveRetainedImageIds({
        retainedImageIdsValue: null,
        currentImageIds: ["img-1", "img-2"],
      }),
    ).toEqual(["img-1", "img-2"]);
  });

  it("treats an empty retention field as deleting all current images", () => {
    expect(
      resolveRetainedImageIds({
        retainedImageIdsValue: "",
        currentImageIds: ["img-1", "img-2"],
      }),
    ).toEqual([]);
  });

  it("filters out unknown ids and removes duplicates", () => {
    expect(
      resolveRetainedImageIds({
        retainedImageIdsValue: "img-2, unknown, img-2, img-1",
        currentImageIds: ["img-1", "img-2"],
      }),
    ).toEqual(["img-2", "img-1"]);
  });
});
