import { expect, test } from "@playwright/test";

test.describe("계정 메뉴 및 인증 TC", () => {
  test("TC-CAL-UC-019 사용자 메뉴 바깥을 클릭하면 메뉴가 닫힌다", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByRole("button", { name: "로그인" }).click();
    await page.getByRole("button", { name: "닫기" }).click();
    await page.getByRole("button", { name: "demoUser", exact: true }).click();
    await expect(page.getByText("yourWatchDemo@rich.calendar")).toBeVisible();

    await page.getByRole("heading", { name: "Rich Calendar" }).click();
    await expect(page.getByText("yourWatchDemo@rich.calendar")).toHaveCount(0);
  });

  test("TC-CAL-UC-020 사용자 메뉴에서 회원 탈퇴 확인 단계에 접근한다", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByRole("button", { name: "로그인" }).click();
    await page.getByRole("button", { name: "닫기" }).click();
    await page.getByRole("button", { name: "demoUser", exact: true }).click();
    await page.getByRole("button", { name: "회원 탈퇴" }).click();

    await expect(page.getByRole("alertdialog")).toContainText("정말로 회원탈퇴를 진행하시겠습니까?");
    await expect(page.getByRole("button", { name: "취소" })).toBeVisible();
    await page.getByRole("button", { name: "취소" }).click();
  });

  test("TC-CAL-UC-021 로그인 후 로그아웃하면 보호된 캘린더에 다시 접근할 수 없다", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByRole("button", { name: "로그인" }).click();
    // Server Action의 루트 리다이렉트가 끝나고 캘린더 안내가 표시될 때까지 기다립니다.
    await expect(page.getByRole("button", { name: "닫기" })).toBeVisible();
    await page.getByRole("button", { name: "닫기" }).click();
    await page.getByRole("button", { name: "demoUser", exact: true }).click();
    await page.getByRole("button", { name: "로그아웃" }).click();
    await expect(page).toHaveURL(/\/auth\/login$/);

    await page.goto("/schedules");
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test("TC-CAL-UC-022 등록 이메일로 데모 아이디를 확인하고 로그인 화면으로 이동한다", async ({ page }) => {
    await page.goto("/auth/find-username");
    await page.getByRole("button", { name: "아이디 찾기" }).click();

    await expect(page.getByText("아이디 : demoUser")).toBeVisible();
    await page.getByRole("button", { name: "로그인 화면으로" }).click();
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test("TC-CAL-UC-023 이메일 인증 코드 확인 후 비밀번호 재설정 화면으로 이동한다", async ({ page }) => {
    await page.goto("/auth/find-pw");
    await page.getByRole("button", { name: "인증번호 발송" }).click();
    const codeToast = page.getByText(/코드 발급 : [A-Z0-9]{6}/).first();
    await expect(codeToast).toBeVisible();
    const code = (await codeToast.textContent())?.match(/[A-Z0-9]{6}/)?.[0];
    expect(code, "데모에서 생성된 인증코드를 토스트에서 확인할 수 있어야 합니다.").toBeTruthy();

    await page.getByPlaceholder("인증코드 입력").fill(code!);
    await page.getByRole("button", { name: "인증" }).click();
    await expect(page.getByRole("heading", { name: "비밀번호 재설정" })).toBeVisible();
    await expect(page.getByRole("button", { name: "비밀번호 변경" })).toBeVisible();
  });

  test("TC-CAL-UC-024 이메일 인증 전에는 회원가입을 제출할 수 없다", async ({ page }) => {
    await page.goto("/auth/signup");
    await expect(page.getByRole("button", { name: "회원가입" })).toBeDisabled();
    await page.getByRole("button", { name: "이메일 인증" }).click();
    await expect(page.getByRole("dialog")).toContainText("데모 버전에서는 이메일로 코드가 발송되지 않습니다.");
  });

  test("TC-CAL-UC-024 데모 인증 코드를 확인한 뒤 회원가입을 완료하고 로그인 화면으로 이동한다", async ({ page }) => {
    await page.goto("/auth/signup");
    await page.getByRole("button", { name: "이메일 인증" }).click();
    // 회원가입 인증 모달 위로 토스트가 노출되지 않는 데모 UI이므로 생성 코드를 고정합니다.
    await page.evaluate(() => {
      Math.random = () => 0;
    });
    await page.getByRole("button", { name: "인증번호 발송" }).click();

    await page.getByPlaceholder("인증코드 입력").fill("AAAAAA");
    await page.getByRole("button", { name: "인증" }).click();

    await page.getByRole("checkbox").click();
    await page.getByRole("button", { name: "회원가입" }).click();
    await expect(page).toHaveURL(/\/auth\/login$/);
  });
});
