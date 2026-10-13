import type FullCalendar from "@fullcalendar/react";
import { describe, expect, it } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";

import { useCalendarControls } from "@/contexts/calendar";

describe("캘린더 제어 기능", () => {
  it("날짜 범위와 선택한 태그에 따라 캘린더 일정을 필터링한다", () => {
    // 병원 예약과 매일 반복하는 요가 일정이 함께 포함된 날짜를 기준으로 검사한다.
    const { result } = renderHook(() => useCalendarControls({ current: null } as React.RefObject<FullCalendar | null>));
    act(() => {
      result.current.updateDateObj("2025-01-15T00:00:00.000Z", "2025-01-16T00:00:00.000Z");
      result.current.updateCheckedTagIds(["02c3d7a6-739d-41b1-94b2-df8b9052e682"]);
    });

    const schedules = result.current.getCalendarSchedules();
    expect(schedules.map(({ id }) => id)).toEqual([
      "6c6d4f72-5447-47ff-9c5d-cbc1a9b1b7b0", // 15일 요가 일정
      "d5f56bc6-4097-4d84-bb02-2b02fd77e3d9", // 15일 병원 예약
    ]);
    expect(schedules.every(({ startAt }) => startAt.startsWith("2025-01-15"))).toBe(true);
  });

  it("태그 선택 상태를 변경하고 클릭한 날짜의 형식을 정리한다", () => {
    // 초기에는 모든 태그가 선택되고 클릭한 날짜는 폼에서 쓰는 형식으로 변환되는지 확인한다.
    const { result } = renderHook(() => useCalendarControls({ current: null } as React.RefObject<FullCalendar | null>));

    expect(result.current.getTagChecked("work-tag")).toBe(true);
    act(() => {
      result.current.updateTagChecked(false, "work-tag");
      result.current.updateClickedDate("2025-04-06T17:30:00");
    });

    expect(result.current.getTagChecked("work-tag")).toBe(false);
    expect(result.current.clickedDate).toBe("2025-04-06");
  });

  it("제공된 제어 함수로 태그를 추가하고 이름을 변경한다", () => {
    // 컴포넌트 이벤트 없이 캘린더 제어 함수의 태그 변경 동작을 확인한다.
    const { result } = renderHook(() => useCalendarControls({ current: null } as React.RefObject<FullCalendar | null>));
    let addedTagId = "";

    act(() => {
      result.current.addTag("Reading");
    });
    addedTagId = result.current.entireTags.find(({ title }) => title === "Reading")?.id ?? "";
    act(() => {
      result.current.updateTag(addedTagId, "Books");
    });

    expect(addedTagId).not.toBe("");
    expect(result.current.entireTags.some(({ id, title }) => id === addedTagId && title === "Books")).toBe(true);
  });
});
