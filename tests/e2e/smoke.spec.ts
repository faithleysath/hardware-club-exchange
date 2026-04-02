import { expect, test } from "@playwright/test";

test("landing page renders and points users to login", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "硬件社团的闲置流转，终于不用再靠翻聊天记录。",
    }),
  ).toBeVisible();

  await expect(page.getByRole("link", { name: "成员登录" }).first()).toBeVisible();
});

test("login page renders GitHub OAuth entry", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "点击按钮，跳到 GitHub 授权" })).toBeVisible();
  await expect(page.getByRole("button", { name: "使用 GitHub 登录" })).toBeVisible();
});
