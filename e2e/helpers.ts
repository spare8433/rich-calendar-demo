import { expect, Page } from "@playwright/test";

// 다른 TC가 로그인 화면의 테스트에 의존하지 않도록 데모 세션 쿠키를 직접 준비합니다.
export async function openCalendar(page: Page) {
  await page.context().addCookies([{ name: "token", value: "playwright-e2e-session", url: "http://localhost:3100" }]);
  await page.goto("/schedules");

  // 첫 방문 안내 모달을 닫아 실제 화면을 조작합니다.
  await page.getByRole("button", { name: "닫기" }).click();
  await expect(page.getByRole("button", { name: "이전으로" })).toBeVisible();
}

// 지정한 달력 날짜를 눌러 실제 캘린더 흐름으로 일정 작성 화면에 진입합니다.
export async function openScheduleCreation(page: Page, date = "2025-01-21") {
  await page.locator(`.fc-daygrid-day[data-date="${date}"] .fc-daygrid-day-top`).click();
  await expect(page).toHaveURL(/\/schedules\/add$/);
}

// 새 일정 작성 화면에서 제목과 설명을 채우고 일정 저장을 완료합니다.
export async function createSchedule(page: Page, title: string, date = "2025-01-21") {
  await openScheduleCreation(page, date);
  await page.getByLabel("제목").fill(title);
  await page.getByLabel("설명").fill("Playwright E2E test schedule");
  await page.getByRole("button", { name: "태그 변경" }).click();
  await page.getByRole("checkbox", { name: "Work" }).click();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "완료" }).click();
  await expect(page).toHaveURL(/\/schedules\/?$/);
  await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
}

// 캘린더에 표시된 일정 이벤트를 눌러 해당 일정의 상세 편집 화면에 진입합니다.
export async function openScheduleDetails(page: Page, title: string) {
  await page.getByText(title, { exact: true }).first().click();
  await expect(page).toHaveURL(/\/schedules\/[^/]+/);
  await expect(page.getByRole("heading", { name: "일정 상세 정보" })).toBeVisible();
}
