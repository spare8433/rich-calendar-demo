import { expect, test } from "@playwright/test";

test.describe("TC-CAL-UC-018 사용자 메뉴 열기", () => {
  test("로그인 후 프로필을 클릭하면 사용자 메뉴가 표시된다", async ({ page }) => {
    // 이 TC의 사전 조건인 로그인 상태를 앱의 데모 로그인 화면으로 만듭니다.
    await page.goto("/auth/login");
    await page.getByRole("button", { name: "로그인" }).click();
    await expect(page).toHaveURL(/\/schedules\/?$/);

    // 캘린더 첫 진입 안내 모달을 닫아 프로필 조작을 가능하게 합니다.
    await page.getByRole("button", { name: "닫기" }).click();

    // 접근성 역할과 버튼 이름으로 프로필을 찾아 사용자 메뉴를 엽니다.
    await page.getByRole("button", { name: "demoUser", exact: true }).click();

    // 계정 정보와 메뉴 항목이 노출되는지 확인해 메뉴가 열린 것을 검증합니다.
    await expect(page.getByText("yourWatchDemo@rich.calendar")).toBeVisible();
    await expect(page.getByRole("button", { name: "로그아웃" })).toBeVisible();
    await expect(page.getByRole("button", { name: "회원 탈퇴" })).toBeVisible();
  });
});
