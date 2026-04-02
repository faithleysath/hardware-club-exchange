import { expect, test } from "@playwright/test";

import {
  cleanupSeededData,
  createListing,
  createRunId,
  expectToastLikeMessage,
  findListingByTitle,
  loginWithPassword,
  seedUser,
  signOut,
  uploadPng,
} from "./helpers";

test.describe("authenticated flows", () => {
  test("member can create a listing and admin can approve it", async ({ page }) => {
    const runId = createRunId();
    const listingTitle = `E2E 测试开发板 ${runId}`;
    const admin = await seedUser({
      email: `admin-${runId}@example.com`,
      password: "temporary-pass",
      displayName: `Admin ${runId}`,
      role: "admin",
      status: "active",
    });
    const member = await seedUser({
      email: `member-${runId}@example.com`,
      password: "temporary-pass",
      displayName: `Member ${runId}`,
      role: "member",
      status: "active",
    });

    try {
      await loginWithPassword(page, member);
      await page.goto("/publish");
      await page.getByLabel("标题").fill(listingTitle);
      await page.getByLabel("价格（元）").fill("199");
      await page.getByLabel("分类").selectOption("board");
      await page.getByLabel("成色").selectOption("used");
      await page.getByLabel("交接地点").fill("创客空间");
      await page.getByLabel("补充联系方式").fill("微信 e2e-member");
      await page.getByLabel("物品描述").fill("这是一条用于端到端测试的发布记录，描述长度足够长。");
      await uploadPng(page);
      await page.getByRole("button", { name: "提交审核" }).click();
      await page.waitForURL(/\/me\/listings/);
      await expect(page.getByText(listingTitle)).toBeVisible();
      await expect(page.getByText("待审核")).toBeVisible();

      await signOut(page);

      await loginWithPassword(page, admin);
      await page.goto("/admin/review");
      await expect(page.getByText(listingTitle)).toBeVisible();
      await page.getByRole("button", { name: "通过" }).click();
      await expect(page.getByText(listingTitle)).not.toBeVisible();

      await page.goto("/");
      await expect(page.getByText(listingTitle)).toBeVisible();
    } finally {
      const createdListing = await findListingByTitle(listingTitle);
      await cleanupSeededData({
        userIds: [admin.id, member.id],
        listingIds: createdListing ? [createdListing.id] : [],
        imagePaths: createdListing ? [createdListing.cover_image_path] : [],
      });
    }
  });

  test("buyer can favorite, reserve, and report a listing across member and admin flows", async ({ page }) => {
    const runId = createRunId();
    const admin = await seedUser({
      email: `admin-report-${runId}@example.com`,
      password: "temporary-pass",
      displayName: `Admin ${runId}`,
      role: "admin",
      status: "active",
    });
    const seller = await seedUser({
      email: `seller-${runId}@example.com`,
      password: "temporary-pass",
      displayName: `Seller ${runId}`,
      role: "member",
      status: "active",
    });
    const buyer = await seedUser({
      email: `buyer-${runId}@example.com`,
      password: "temporary-pass",
      displayName: `Buyer ${runId}`,
      role: "member",
      status: "active",
    });
    const listing = await createListing({
      sellerId: seller.id,
      title: `E2E 收藏预约 ${runId}`,
    });

    try {
      await loginWithPassword(page, buyer);
      await page.goto(`/items/${listing.id}`);
      await page.getByRole("button", { name: "加入收藏" }).click();
      await page.goto("/me/favorites");
      await expect(page.getByText(`E2E 收藏预约 ${runId}`)).toBeVisible();

      await page.goto(`/items/${listing.id}`);
      await page.getByPlaceholder("例如：我这周都在实验室，想优先约周三晚上面交。").fill("我想排在前面看看，周三晚上有空。");
      await page.getByRole("button", { name: "发送预约" }).click();
      await expectToastLikeMessage(page, "预约已发送给卖家，等待对方处理。");

      await page.goto("/me/reservations");
      await expect(page.getByText(`E2E 收藏预约 ${runId}`)).toBeVisible();
      await expect(page.getByText("待卖家处理")).toBeVisible();

      await page.goto(`/items/${listing.id}`);
      await page.getByPlaceholder("例如：图片与描述严重不符，且联系方式存在明显引流信息。").fill("这是一条测试举报，用于验证管理员处理链路。");
      await page.getByRole("button", { name: "提交举报" }).click();
      await expectToastLikeMessage(page, "举报已提交，管理员会在审核台处理。");

      await signOut(page);

      await loginWithPassword(page, seller);
      await page.goto("/me/reservations");
      await expect(page.getByText(`E2E 收藏预约 ${runId}`)).toBeVisible();
      await page.getByRole("button", { name: "接受预约" }).click();
      await expect(page.getByText("已接受")).toBeVisible();

      await signOut(page);

      await loginWithPassword(page, admin);
      await page.goto("/admin/reports");
      await expect(page.getByText(`E2E 收藏预约 ${runId}`)).toBeVisible();
      await page.getByPlaceholder("写清楚处理动作，例如已下架、已联系卖家补充信息等。").fill("测试已核查，保留内容并关闭举报。");
      await page.getByRole("button", { name: "标记已处理" }).click();
      await expect(page.getByText("已处理")).toBeVisible();
    } finally {
      await cleanupSeededData({
        userIds: [admin.id, seller.id, buyer.id],
        listingIds: [listing.id],
        imagePaths: [listing.imagePath],
      });
    }
  });
});
