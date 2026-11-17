import { expect, test } from "@playwright/test";

import { openCalendar } from "./helpers";

test.describe("캘린더 보기 및 태그 필터 TC", () => {
  test.beforeEach(async ({ page }) => openCalendar(page));

  test("TC-CAL-UC-025 월·주·일 보기와 기간 이동을 사용할 수 있다", async ({ page }) => {
    await expect(page.locator(".fc-dayGridMonth-view")).toBeVisible();
    await page.getByRole("button", { name: "이전으로" }).click();
    await expect(page.locator(".fc-dayGridMonth-view")).toBeVisible();
    await page.getByRole("button", { name: "다음으로" }).click();

    await page.getByRole("button", { name: "주 단위 화면으로" }).click();
    await expect(page.locator(".fc-timeGridWeek-view")).toBeVisible();
    await page.getByRole("button", { name: "이전으로" }).click();
    await page.getByRole("button", { name: "다음으로" }).click();

    await page.getByRole("button", { name: "일 단위 화면으로" }).click();
    await expect(page.locator(".fc-timeGridDay-view")).toBeVisible();
    await page.getByRole("button", { name: "이전으로" }).click();
    await page.getByRole("button", { name: "다음으로" }).click();
  });

  test("TC-CAL-UC-026 태그 선택을 바꾸면 캘린더 일정도 필터링된다", async ({ page }) => {
    await expect(page.getByText("Team Meeting", { exact: true }).first()).toBeVisible();
    await page.getByRole("combobox", { name: "일정 필터 선택" }).click();
    await page.getByRole("checkbox", { name: "Work" }).click();

    await expect(page.getByText("Team Meeting", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Doctor Appointment", { exact: true }).first()).toBeVisible();

    await page.getByRole("checkbox", { name: "Work" }).click();
    await expect(page.getByText("Team Meeting", { exact: true }).first()).toBeVisible();
  });

  test("TC-CAL-UC-027 뷰와 기간 변경에 맞춰 사이드 메뉴 일정을 갱신한다", async ({ page }) => {
    await page.getByRole("button", { name: "일정 목록 표시" }).click();
    const scheduleList = page.getByRole("complementary");
    await expect(scheduleList.getByRole("heading", { name: "일정 목록" })).toBeVisible();
    await expect(scheduleList.getByText("Doctor Appointment", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "주 단위 화면으로" }).click();
    await expect(scheduleList.getByRole("heading", { name: "일정 목록" })).toBeVisible();
    await page.getByRole("button", { name: "일 단위 화면으로" }).click();
    await expect(scheduleList.getByRole("heading", { name: "일정 목록" })).toBeVisible();
    await page.getByRole("button", { name: "다음으로" }).click();
    await expect(scheduleList.getByRole("heading", { name: "일정 목록" })).toBeVisible();
  });

  test("TC-CAL-UC-028 태그 필터를 뷰 및 사이드 메뉴와 함께 적용한다", async ({ page }) => {
    test.fail(true, "현재 사이드 메뉴는 선택된 태그 필터를 적용하지 않아 캘린더와 결과가 다릅니다.");
    await page.getByRole("combobox", { name: "일정 필터 선택" }).click();
    await page.getByRole("checkbox", { name: "Work" }).click();
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: "일정 목록 표시" }).click();
    const scheduleList = page.getByRole("complementary");
    await expect(page.getByText("Team Meeting", { exact: true })).toHaveCount(0);
    await expect(scheduleList.getByText("Yoga Class", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "주 단위 화면으로" }).click();
    await expect(page.locator(".fc-timeGridWeek-view")).toBeVisible();
    await page.getByRole("button", { name: "다음으로" }).click();
    await expect(scheduleList.getByRole("heading", { name: "일정 목록" })).toBeVisible();
  });
});
