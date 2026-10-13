import { describe, expect, it, jest } from "@jest/globals";

import generateCode, {
  calculateDateRangeDiff,
  calculateRepeatEndDate,
  cn,
  getScheduleColorVariable,
} from "@/lib/utils";

describe("공통 유틸리티", () => {
  it("충돌하는 Tailwind 클래스를 병합하고 조건부 클래스를 유지한다", () => {
    // 같은 그룹의 클래스는 뒤에 전달된 값이 앞선 값을 대체하는지 확인한다.
    // eslint-disable-next-line tailwindcss/no-contradicting-classname
    expect(cn("px-2 text-sm", false && "hidden", "px-4 font-bold")).toBe("text-sm px-4 font-bold");
  });

  it("일정 색상을 캘린더에서 사용하는 CSS 변수로 변환한다", () => {
    // 일정의 색상값이 애플리케이션의 색상 토큰과 연결되는지 확인한다.
    expect(getScheduleColorVariable("blue")).toEqual({
      "--schedule-background": "var(--blue-background)",
      "--schedule": "var(--blue)",
    });
  });

  it("반복 일정의 마지막 종료 날짜를 계산한다", () => {
    // 반복 간격과 횟수를 적용해 마지막 일정의 종료일을 구하는지 확인한다.
    expect(
      calculateRepeatEndDate({
        endDate: "2025-01-01T10:00:00.000Z",
        repeatInterval: 2,
        repeatEndCount: 3,
        repeatFrequency: "weekly",
      }),
    ).toBe("2025-02-12T10:00:00.000Z");
  });

  it("시작 시간과 종료 시간의 변경량을 각각 계산한다", () => {
    // 일정 크기를 조정할 때 시작과 종료가 서로 다른 시간만큼 바뀔 수 있음을 확인한다.
    expect(
      calculateDateRangeDiff({
        beforeStartAt: "2025-01-01T09:00:00.000Z",
        beforeEndAt: "2025-01-01T10:00:00.000Z",
        startAt: "2025-01-01T09:30:00.000Z",
        endAt: "2025-01-01T11:00:00.000Z",
      }),
    ).toEqual({ startDiffMs: 30 * 60 * 1000, endDiffMs: 60 * 60 * 1000 });
  });

  it("영문 대문자와 숫자로 구성된 6자리 인증 코드를 생성한다", () => {
    // 난수 값을 고정해 결과를 예측 가능하게 하고 코드 형식을 확인한다.
    const random = jest.spyOn(Math, "random").mockReturnValue(0);
    try {
      expect(generateCode()).toBe("AAAAAA");
      expect(generateCode()).toMatch(/^[A-Z0-9]{6}$/);
    } finally {
      random.mockRestore();
    }
  });
});
