import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";

import { useToast } from "@/hooks/use-toast";

// describe는 관련 테스트를 한 그룹으로 묶는다.
describe("useToast", () => {
  let latestToastState: ReturnType<typeof useToast> | undefined;

  // beforeEach는 각 it 테스트가 시작되기 전에 실행된다.
  beforeEach(() => {
    // 실제 시간을 기다리는 대신 advanceTimersByTime으로 시간을 원하는 만큼 이동할 수 있게 한다.
    jest.useFakeTimers();
  });

  // afterEach는 각 테스트가 끝날 때 실행되어 다음 테스트에 영향을 줄 상태를 정리한다.
  afterEach(() => {
    act(() => {
      // useToast가 관리하는 토스트를 모두 닫고, 예약된 제거 타이머도 모두 실행한다.
      latestToastState?.dismiss();
      jest.runOnlyPendingTimers();
    });
    latestToastState = undefined;
    // 다음 테스트와 다른 테스트 파일은 실제 타이머를 사용하도록 되돌린다.
    jest.useRealTimers();
  });

  // it은 하나의 기대 동작을 검증하는 테스트 사례를 정의한다.
  it("초기에는 토스트가 없다", () => {
    // renderHook은 React 컴포넌트를 직접 만들지 않고 커스텀 훅을 렌더링한다.
    // result.current를 통해 현재 훅의 반환값을 읽는다.
    const { result } = renderHook(() => useToast());
    latestToastState = result.current;

    // expect는 실제 결과를 확인하고, toEqual은 배열/객체의 값을 깊게 비교한다.
    expect(result.current.toasts).toEqual([]);
  });

  it("toast로 토스트를 만들고 핸들로 내용을 갱신한다", () => {
    const { result } = renderHook(() => useToast());
    latestToastState = result.current;

    let handle: ReturnType<typeof result.current.toast>;
    // act는 React 상태를 바꾸는 작업을 감싸 업데이트와 렌더링이 끝난 뒤 검증하게 한다.
    act(() => {
      handle = result.current.toast({ title: "저장 중" });
    });

    // toHaveLength는 배열 길이를, toMatchObject는 객체의 일부 속성만 비교한다.
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      id: handle!.id,
      title: "저장 중",
      open: true,
    });

    act(() => {
      handle!.update({ title: "저장 완료", description: "변경 사항이 저장됐습니다." });
    });

    expect(result.current.toasts[0]).toMatchObject({
      id: handle!.id,
      title: "저장 완료",
      description: "변경 사항이 저장됐습니다.",
      open: true,
    });
  });

  it("표시 개수를 제한하고 가장 최근 토스트를 보여준다", () => {
    const { result } = renderHook(() => useToast());
    latestToastState = result.current;

    act(() => {
      result.current.toast({ title: "첫 번째" });
      result.current.toast({ title: "두 번째" });
    });

    expect(result.current.toasts).toHaveLength(1);
    // toBe는 문자열, 숫자, boolean 등 원시 값의 일치 여부를 확인한다.
    expect(result.current.toasts[0].title).toBe("두 번째");
  });

  it("dismiss하면 먼저 닫힘 상태가 되고 지연 후 목록에서 제거한다", () => {
    const { result } = renderHook(() => useToast());
    latestToastState = result.current;

    let handle: ReturnType<typeof result.current.toast>;
    act(() => {
      handle = result.current.toast({ title: "닫을 토스트" });
    });

    act(() => {
      handle!.dismiss();
    });

    // dismiss 직후에는 퇴장 애니메이션을 위해 목록에 남아 있고 open만 false가 된다.
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].open).toBe(false);

    act(() => {
      // 999ms만 경과시켜 아직 제거 타이머(1000ms)가 실행되지 않았음을 확인한다.
      jest.advanceTimersByTime(999);
    });
    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      // 남은 1ms를 진행하면 예약된 setTimeout이 실행되어 토스트가 제거된다.
      jest.advanceTimersByTime(1);
    });
    expect(result.current.toasts).toEqual([]);
  });

  it("Radix의 onOpenChange(false)도 같은 dismiss 흐름을 탄다", () => {
    const { result } = renderHook(() => useToast());
    latestToastState = result.current;

    act(() => {
      result.current.toast({ title: "닫기 버튼으로 닫을 토스트" });
    });

    act(() => {
      result.current.toasts[0].onOpenChange?.(false);
    });

    // Radix Toast에서 닫힘을 알리는 콜백도 handle.dismiss와 같은 경로를 사용한다.
    expect(result.current.toasts[0].open).toBe(false);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.toasts).toEqual([]);
  });

  it("인자를 생략한 dismiss는 현재 토스트 전체를 닫고 제거한다", () => {
    const { result } = renderHook(() => useToast());
    latestToastState = result.current;

    act(() => {
      result.current.toast({ title: "현재 토스트" });
      // 인자 없는 dismiss는 현재 목록의 모든 토스트를 대상으로 한다.
      result.current.dismiss();
    });

    expect(result.current.toasts[0].open).toBe(false);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.toasts).toEqual([]);
  });
});
