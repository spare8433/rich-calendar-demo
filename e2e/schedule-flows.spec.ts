import { expect, test } from "@playwright/test";

import { createSchedule, openCalendar, openScheduleCreation, openScheduleDetails } from "./helpers";

test.describe("일정 생성 및 수정 TC", () => {
  test.beforeEach(async ({ page }) => openCalendar(page));

  test("TC-CAL-UC-002 제목이 비어 있으면 필수값 오류가 표시되고 저장할 수 없다", async ({ page }) => {
    await openScheduleCreation(page);
    await page.getByLabel("제목").focus();
    await page.getByLabel("제목").blur();

    await expect(page.getByText("제목은 최소 2자 이상 작성해야합니다.")).toBeVisible();
    await expect(page.getByRole("button", { name: "완료" })).toBeDisabled();
  });

  test("TC-CAL-UC-003 작성 중 뒤로가면 일정 생성을 취소한다", async ({ page }) => {
    await openScheduleCreation(page);
    await page.getByLabel("제목").fill("Canceled schedule");
    await page.getByRole("button", { name: "캘린더로 돌아가기" }).click();

    await expect(page).toHaveURL(/\/schedules\/?$/);
    await expect(page.getByText("Canceled schedule", { exact: true })).toHaveCount(0);
  });

  test("TC-CAL-UC-004 저장한 일정이 캘린더에 표시된다", async ({ page }) => {
    await createSchedule(page, "Created by E2E");
  });

  test("TC-CAL-UC-005 확인을 거쳐 기존 일정을 수정한다", async ({ page }) => {
    await openScheduleDetails(page, "Doctor Appointment");
    await page.getByLabel("제목").fill("Updated by E2E");
    await page.getByRole("button", { name: "저장" }).click();
    await page.getByRole("button", { name: "확인" }).click();

    await expect(page).toHaveURL(/\/schedules\/?$/);
    await expect(page.getByText("Updated by E2E", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Doctor Appointment", { exact: true })).toHaveCount(0);
  });

  test("TC-CAL-UC-006 수정 화면에서 캘린더로 돌아가면 변경하지 않는다", async ({ page }) => {
    await openScheduleDetails(page, "Doctor Appointment");
    await page.getByLabel("제목").fill("Discarded edit");
    await page.getByRole("button", { name: "캘린더로 돌아가기" }).click();

    await expect(page.getByText("Doctor Appointment", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Discarded edit", { exact: true })).toHaveCount(0);
  });

  test("TC-CAL-UC-007 수정 확인 모달에서 취소하면 변경하지 않는다", async ({ page }) => {
    await openScheduleDetails(page, "Doctor Appointment");
    await page.getByLabel("제목").fill("Canceled confirmation");
    await page.getByRole("button", { name: "저장" }).click();
    await page.getByRole("button", { name: "취소" }).click();

    await expect(page.getByRole("heading", { name: "일정 상세 정보" })).toBeVisible();
    await expect(page.getByLabel("제목")).toHaveValue("Canceled confirmation");
    await page.getByRole("button", { name: "캘린더로 돌아가기" }).click();
    await expect(page.getByText("Doctor Appointment", { exact: true }).first()).toBeVisible();
  });

  test("TC-CAL-UC-012 수정 데이터가 새로고침 후에도 유지된다", async ({ page }) => {
    test.fail(true, "데모 캘린더 상태는 React 메모리에만 있어 새로고침하면 초기 데이터로 복원됩니다.");
    await openScheduleDetails(page, "Doctor Appointment");
    await page.getByLabel("제목").fill("Persistent edit");
    await page.getByRole("button", { name: "저장" }).click();
    await page.getByRole("button", { name: "확인" }).click();
    await expect(page.getByText("Persistent edit", { exact: true }).first()).toBeVisible();

    await page.reload();
    await page.getByRole("button", { name: "닫기" }).click();
    await expect(page.getByText("Persistent edit", { exact: true }).first()).toBeVisible();
  });

  test("TC-CAL-UC-014 필수 제목을 지우면 수정 내용을 저장할 수 없다", async ({ page }) => {
    await openScheduleDetails(page, "Doctor Appointment");
    await page.getByLabel("제목").fill("");
    await page.getByLabel("제목").blur();

    await expect(page.getByText("제목은 최소 2자 이상 작성해야합니다.")).toBeVisible();
    await expect(page.getByRole("button", { name: "저장" })).toBeDisabled();
  });

  test("TC-CAL-UC-015 생성 제목의 50자 제한을 검증한다", async ({ page }) => {
    await openScheduleCreation(page);
    const title = "A".repeat(51);
    await page.getByLabel("제목").fill(title);
    await page.getByLabel("설명").fill("Valid description");
    await page.getByLabel("제목").blur();

    await expect(page.getByLabel("제목")).toHaveValue(title);
    await expect(page.getByText("제목은 최대 50자까지 작성가능합니다.")).toBeVisible();
    await expect(page.getByRole("button", { name: "완료" })).toBeDisabled();
  });

  test("TC-CAL-UC-016 상세 화면의 뒤로가기로 캘린더에 돌아간다", async ({ page }) => {
    await openScheduleDetails(page, "Doctor Appointment");
    await page.getByRole("button", { name: "캘린더로 돌아가기" }).click();

    await expect(page).toHaveURL(/\/schedules\/?$/);
    await expect(page.getByRole("button", { name: "이전으로" })).toBeVisible();
  });
});

test.describe("일정 삭제 TC", () => {
  test.beforeEach(async ({ page }) => openCalendar(page));

  test("TC-CAL-UC-009 삭제 확인에서 취소하면 일정이 남아 있다", async ({ page }) => {
    await openScheduleDetails(page, "Doctor Appointment");
    await page.getByRole("button", { name: "일정 삭제" }).click();
    await page.getByRole("button", { name: "취소" }).click();
    await expect(page.getByRole("heading", { name: "일정 상세 정보" })).toBeVisible();

    await page.getByRole("button", { name: "캘린더로 돌아가기" }).click();
    await expect(page.getByText("Doctor Appointment", { exact: true }).first()).toBeVisible();
  });

  test("TC-CAL-UC-010 삭제를 확인하면 일정이 캘린더에서 사라진다", async ({ page }) => {
    await openScheduleDetails(page, "Doctor Appointment");
    await page.getByRole("button", { name: "일정 삭제" }).click();
    await page.getByRole("button", { name: "확인" }).click();

    await expect(page).toHaveURL(/\/schedules\/?$/);
    await expect(page.getByText("Doctor Appointment", { exact: true })).toHaveCount(0);
  });

  test("TC-CAL-UC-013 삭제 결과가 새로고침 후에도 유지된다", async ({ page }) => {
    test.fail(true, "데모 캘린더 상태는 React 메모리에만 있어 새로고침하면 삭제 전 초기 데이터로 복원됩니다.");
    await openScheduleDetails(page, "Doctor Appointment");
    await page.getByRole("button", { name: "일정 삭제" }).click();
    await page.getByRole("button", { name: "확인" }).click();
    await expect(page.getByText("Doctor Appointment", { exact: true })).toHaveCount(0);

    await page.reload();
    await page.getByRole("button", { name: "닫기" }).click();
    await expect(page.getByText("Doctor Appointment", { exact: true })).toHaveCount(0);
  });
});

test.describe("일정 표시 TC", () => {
  test.beforeEach(async ({ page }) => openCalendar(page));

  test("TC-CAL-UC-011 여러 새 일정을 같은 캘린더에 표시한다", async ({ page }) => {
    await createSchedule(page, "First E2E schedule");
    await createSchedule(page, "Second E2E schedule");

    await expect(page.getByText("First E2E schedule", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Second E2E schedule", { exact: true }).first()).toBeVisible();
  });

  test("TC-CAL-UC-017 캘린더 첫 진입 시 샘플 일정이 표시된다", async ({ page }) => {
    await expect(page.getByText("Doctor Appointment", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Team Meeting", { exact: true }).first()).toBeVisible();
  });
});
