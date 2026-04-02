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
