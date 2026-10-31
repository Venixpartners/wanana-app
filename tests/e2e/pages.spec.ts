import { expect, test } from "@playwright/test";

test("landing page shows the tagline, previews and waitlist", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("The AI Intelligence Layer for African Music Conversations");
  await expect(page.getByText("Fan Pulse").first()).toBeVisible();
  await expect(page.getByText("Fan Chart")).toBeVisible();
  await expect(page.locator("#join")).toBeAttached();
});

test("waitlist rejects a bad email without leaving the page", async ({ page }) => {
  await page.goto("/");
  await page.locator("#email").fill("not-an-email");
  await page.locator("#join").getByRole("button", { name: "Join the waitlist" }).click();
  await expect(page.locator("form p[role=alert]")).toHaveText("That email address doesn't look right.");
});

test("sign in validates before contacting the server", async ({ page }) => {
  await page.goto("/signin");
  await expect(page.getByRole("heading", { name: "Sign in to Wanana" })).toBeVisible();
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.locator("form p[role=alert]")).toHaveText("That email address doesn't look right.");
});

test("password can be shown and hidden", async ({ page }) => {
  await page.goto("/signin");
  const field = page.locator("#password");
  await field.fill("secret123");
  await expect(field).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(field).toHaveAttribute("type", "text");
});

test("sign up explains the password rule", async ({ page }) => {
  await page.goto("/signup");
  await page.locator("#email").fill("fan@example.com");
  await page.locator("#password").fill("short");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.locator("form p[role=alert]")).toHaveText("Use at least 8 characters.");
});

test("sign in and sign up link to each other and to password reset", async ({ page }) => {
  await page.goto("/signin");
  await page.getByRole("link", { name: "Create an account" }).click();
  await expect(page).toHaveURL(/\/signup$/);
  await page.getByRole("link", { name: "Sign in" }).last().click();
  await page.getByRole("link", { name: "Forgot your password?" }).click();
  await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible();
});

test("signed out visitors are sent to sign in", async ({ page }) => {
  for (const path of ["/me", "/onboarding", "/settings/profile"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/signin$/);
  }
  await page.goto("/reset-password");
  await expect(page).toHaveURL(/\/forgot-password$/);
});

test("callback refuses to redirect off site", async ({ page }) => {
  await page.goto("/auth/callback?next=//evil.example");
  await expect(page).toHaveURL(/\/signin\?error=link$/);
});

test("admin pages send signed out visitors to sign in", async ({ page }) => {
  for (const path of ["/admin", "/admin/catalogue", "/admin/catalogue/artists/new", "/admin/catalogue/songs/new"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/signin$/);
  }
});

test("unknown catalogue pages show a friendly not found page", async ({ page }) => {
  for (const path of ["/artist/no-such-artist", "/album/no-such-album", "/song/no-such-song"]) {
    const res = await page.goto(path);
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "We couldn't find that page" })).toBeVisible();
  }
});

test("main menu links work and highlight the current section", async ({ page }) => {
  test.setTimeout(120_000);
  const nav = page.getByRole("navigation", { name: "Main" });
  await page.goto("/search");
  await nav.getByRole("link", { name: "Community" }).click();
  await expect(page).toHaveURL(/\/community$/, { timeout: 45_000 });
  await expect(page.getByRole("heading", { level: 1, name: "Community" })).toBeVisible({ timeout: 45_000 });
  for (const [label, path] of [["Explore", "/explore"], ["Community", "/community"], ["Polls", "/polls"], ["Rankings", "/rankings"], ["Search", "/search"]]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: label })).toBeVisible();
    await expect(nav.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
  }
});

test("search asks for two letters and keeps the query in the link", async ({ page }) => {
  await page.goto("/search?q=a");
  await expect(page.getByText("Type at least two letters.")).toBeVisible();
  await page.locator("#q-lg").fill("zzqx");
  await page.locator("#q-lg").press("Enter");
  await expect(page).toHaveURL(/\/search\?q=zzqx$/);
  await expect(page.getByText(/Nothing matches “zzqx” yet/)).toBeVisible();
});

test("signed out visitors are asked to sign in before posting", async ({ page }) => {
  for (const path of ["/community/new", "/polls/new", "/rankings/new"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/signin$/);
  }
});

test("unknown community pages show the not found page", async ({ page }) => {
  for (const path of ["/community/not-an-id", "/polls/00000000-0000-0000-0000-000000000000", "/rankings/not-an-id", "/reviews/not-an-id", "/u/no_such_fan_here", "/explore/genre/no-such-genre"]) {
    const res = await page.goto(path);
    expect(res?.status()).toBe(404);
  }
});
