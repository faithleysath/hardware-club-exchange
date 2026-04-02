import { expect, test } from "@playwright/test";

import {
  cleanupSeededData,
  createRunId,
  findAuthUserIdByEmail,
  loginWithPassword,
  seedUser,
} from "./helpers";

test("admin can create a managed email account", async ({ page }) => {
  const runId = createRunId();
  const admin = await seedUser({
    email: `admin-create-${runId}@example.com`,
    password: "temporary-pass",
    displayName: `Admin ${runId}`,
    role: "admin",
    status: "active",
  });
  const memberEmail = `managed-${runId}@example.com`;

  try {
    await loginWithPassword(page, admin);
    await page.goto("/admin/members");
    await page.getByLabel("邮箱").fill(memberEmail);
    await page.getByLabel("临时密码").fill("temporary-pass");
    await page.getByRole("button", { name: "创建邮箱账号" }).click();

    await expect(
      page.getByText("账号已创建，对方可以登录，但仍会处于待审核状态。"),
    ).toBeVisible({ timeout: 10000 });
  } finally {
    const createdMemberId = await findAuthUserIdByEmail(memberEmail);

    await cleanupSeededData({
      userIds: createdMemberId ? [admin.id, createdMemberId] : [admin.id],
      listingIds: [],
      imagePaths: [],
    });
  }
});

test("admin can delete a member account", async ({ page }) => {
  const runId = createRunId();
  const admin = await seedUser({
    email: `admin-delete-${runId}@example.com`,
    password: "temporary-pass",
    displayName: `Admin ${runId}`,
    role: "admin",
    status: "active",
  });
  const member = await seedUser({
    email: `member-delete-${runId}@example.com`,
    password: "temporary-pass",
    displayName: `Member ${runId}`,
    role: "member",
    status: "active",
  });

  try {
    await loginWithPassword(page, admin);
    await page.goto("/admin/members");

    page.once("dialog", async (dialog) => {
      await dialog.accept();
    });

    const memberCard = page.locator("article").filter({ hasText: member.email });
    await memberCard.getByRole("button", { name: "删除成员" }).click();

    await expect(page.locator("article").filter({ hasText: member.email })).toHaveCount(0, {
      timeout: 15000,
    });
    await expect
      .poll(() => findAuthUserIdByEmail(member.email), { timeout: 15000 })
      .toBeNull();
  } finally {
    await cleanupSeededData({
      userIds: [admin.id],
      listingIds: [],
      imagePaths: [],
    });
  }
});
