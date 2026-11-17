import { defineConfig, devices } from "@playwright/test";

// e2e 폴더의 테스트를 Chromium 브라우저에서 실행하는 설정입니다.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  workers: 2,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    // Server Action 리다이렉트와 쿠키 호스트가 일치하도록 localhost를 사용합니다.
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // 테스트 전에 개발 서버를 켜고, 테스트가 끝나면 Playwright가 서버를 정리합니다.
  webServer: {
    command: "pnpm dev --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
