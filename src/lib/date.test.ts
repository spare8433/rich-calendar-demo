import { describe, expect, it } from "@jest/globals";
import dayjs from "dayjs";

import {
  areDatesEqual,
  changeDateIfMidnight,
  getMonthDateRange,
  getWeekDateRange,
  modifyOnlyDate,
  modifyOnlyTime,
} from "@/lib/date";

describe("날짜 유틸리티", () => {
  it("일요일부터 토요일까지의 주 단위로 한 달의 달력 범위를 반환한다", () => {
    // 월의 시작과 끝이 주중에 있는 경우에도 전체 주간 범위를 포함하는지 확인한다.
    const range = getMonthDateRange("2024-02-15");

    expect(range).toEqual({
      startDate: dayjs("2024-02-01").startOf("month").startOf("week").toISOString(),
      endDate: dayjs("2024-02-29").endOf("month").endOf("week").toISOString(),
    });
  });

  it("입력 날짜가 포함된 주의 시작과 끝을 반환한다", () => {
    // 선택한 날짜만이 아니라 해당 주의 양쪽 경계를 반환하는지 확인한다.
    const range = getWeekDateRange("2025-01-08");

    expect(range).toEqual({
      startDate: dayjs("2025-01-08").startOf("week").toISOString(),
      endDate: dayjs("2025-01-08").endOf("week").toISOString(),
    });
  });

  it("자정 날짜는 날짜 형식으로 바꾸고 자정이 아닌 입력은 유지한다", () => {
    // 날짜 전용 일정이 시간 일정으로 해석되어 날짜가 밀리지 않도록 확인한다.
    expect(changeDateIfMidnight("2025-03-04T00:00:00")).toBe("2025-03-04");
    expect(changeDateIfMidnight("2025-03-04T10:15:00")).toBe("2025-03-04T10:15:00");
  });

  it("날짜와 시간을 비교하고 날짜만 바꿀 때 기존 시간을 유지한다", () => {
    // 날짜를 바꿔도 원래의 시·분·초가 보존되는지 확인한다.
    expect(areDatesEqual("2025-01-01T12:00:00", "2025-01-01T12:00:00")).toBe(true);
    expect(areDatesEqual("2025-01-01T12:00:00", "2025-01-01T12:00:01")).toBe(false);
    expect(modifyOnlyDate("2025-01-02T14:35:20", "2025-04-06").format("YYYY-MM-DD HH:mm:ss")).toBe(
      "2025-04-06 14:35:20",
    );
  });

  it("시간을 변경할 때 시와 분만 바꾸고 나머지는 유지한다", () => {
    // 시간 선택값을 적용해도 기존 날짜와 초가 보존되는지 확인한다.
    expect(modifyOnlyTime("2025-01-02T14:35:20", "08:10").format("YYYY-MM-DD HH:mm:ss")).toBe("2025-01-02 08:10:20");
  });
});
