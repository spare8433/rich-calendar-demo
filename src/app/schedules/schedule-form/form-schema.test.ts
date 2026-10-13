import { describe, expect, it } from "@jest/globals";

import { scheduleSchema } from "@/app/schedules/schedule-form/form-schema";

const validSchedule = {
  title: "Planning",
  color: "blue",
  startDate: "2025-01-01T09:00:00.000Z",
  endDate: "2025-01-01T10:00:00.000Z",
  description: "Team planning",
  tags: [{ id: "work", title: "Work" }],
  importance: "medium",
  isRepeat: "no",
};

describe("일정 폼 스키마", () => {
  it("필수 값과 날짜 및 선택 항목이 올바른 일정 정보를 허용한다", () => {
    // 반복하지 않는 일정에 필요한 필드가 모두 있는 대표 입력값으로 검증한다.
    expect(scheduleSchema.safeParse(validSchedule).success).toBe(true);
  });

  it("제목과 설명이 허용된 길이를 벗어나면 거부한다", () => {
    // 사용자에게 표시되는 제목과 설명의 최소·최대 길이를 확인한다.
    expect(scheduleSchema.safeParse({ ...validSchedule, title: "A" }).success).toBe(false);
    expect(scheduleSchema.safeParse({ ...validSchedule, title: "T".repeat(51) }).success).toBe(false);
    expect(scheduleSchema.safeParse({ ...validSchedule, description: "A" }).success).toBe(false);
    expect(scheduleSchema.safeParse({ ...validSchedule, description: "D".repeat(201) }).success).toBe(false);
  });

  it("잘못된 날짜와 지원하지 않는 색상 또는 중요도를 거부한다", () => {
    // 날짜와 선택 항목이 캘린더에서 처리할 수 있는 값인지 확인한다.
    expect(scheduleSchema.safeParse({ ...validSchedule, startDate: "not-a-date" }).success).toBe(false);
    expect(scheduleSchema.safeParse({ ...validSchedule, endDate: "not-a-date" }).success).toBe(false);
    expect(scheduleSchema.safeParse({ ...validSchedule, color: "black" }).success).toBe(false);
    expect(scheduleSchema.safeParse({ ...validSchedule, importance: "urgent" }).success).toBe(false);
  });

  it("반복 횟수 문자열을 숫자로 변환하고 허용 범위를 확인한다", () => {
    // 브라우저 폼에서 문자열로 전달되는 반복 옵션을 숫자로 변환하는지 확인한다.
    const parsed = scheduleSchema.safeParse({
      ...validSchedule,
      isRepeat: "yes",
      repeatInterval: "2",
      repeatFrequency: "weekly",
      repeatEndCount: "3",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.repeatInterval).toBe(2);
      expect(parsed.data.repeatEndCount).toBe(3);
    }

    expect(scheduleSchema.safeParse({ ...validSchedule, repeatInterval: "0" }).success).toBe(false);
    expect(scheduleSchema.safeParse({ ...validSchedule, repeatEndCount: "31" }).success).toBe(false);
  });
});
