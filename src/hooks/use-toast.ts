"use client";

// Inspired by react-hot-toast library
import * as React from "react";

import type { ToastActionElement, ToastProps } from "@/app/components/ui/toast";

const TOAST_LIMIT = 1; // 화면에 동시에 유지할 최대 개수
const TOAST_REMOVE_DELAY = 1000; // 닫힘 애니메이션 후 실제 목록에서 제거하기까지의 시간

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type ToastInput = Omit<ToasterToast, "id">;

let count = 0;

// 각 토스트에 충돌하지 않는 문자열 ID를 부여한다.
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

// 외부 저장소에 적용할 수 있는 변경 명령. reducer가 이 명령을 새 상태로 변환한다.
type Action =
  | {
      type: "ADD_TOAST";
      toast: ToasterToast;
    }
  | {
      type: "UPDATE_TOAST";
      toast: Partial<ToasterToast>;
    }
  | {
      type: "DISMISS_TOAST";
      toastId?: ToasterToast["id"];
    }
  | {
      type: "REMOVE_TOAST";
      toastId?: ToasterToast["id"];
    };

// 현재 상태와 명령으로 다음 상태를 계산한다. 상태를 직접 수정하지 않으며,
// 타이머 예약 같은 부수 효과는 dismissToast에서 처리한다.
const reducer = (state: ToasterToast[], action: Action): ToasterToast[] => {
  switch (action.type) {
    case "ADD_TOAST":
      return [action.toast, ...state].slice(0, TOAST_LIMIT);

    case "UPDATE_TOAST":
      return state.map((toast) => (toast.id === action.toast.id ? { ...toast, ...action.toast } : toast));

    case "DISMISS_TOAST": {
      const { toastId } = action;
      return state.map((toast) => (toast.id === toastId || toastId === undefined ? { ...toast, open: false } : toast));
    }

    case "REMOVE_TOAST":
      return action.toastId === undefined ? [] : state.filter((toast) => toast.id !== action.toastId);
  }
};

const listeners = new Set<() => void>();
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

// React 바깥에 있는 외부 저장소의 현재 값이다.
// 모듈 단위 저장소이므로 컴포넌트에서 훅을 호출하지 않고 만든 토스트도 Toaster에 표시된다.
let memoryState: ToasterToast[] = [];

// 명령을 적용하고 저장소 값을 바꾼 다음, 모든 구독자에게 "값이 바뀌었으니 다시 확인하라"고 알린다.
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener();
  });
}

// useSyncExternalStore가 전달하는 알림 함수를 저장소 구독자로 등록한다.
// 저장소가 바뀔 때 호출하면 React가 getSnapshot을 다시 읽고 필요한 렌더링을 수행한다.
// 반환 함수는 구독 해제용이며 컴포넌트가 구독을 끝낼 때 React가 호출한다.
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// listeners는 알림 함수들을 담는 iterable한 Set이지, 토스트 상태를 담는 저장소가 아니다.
// 토스트 데이터는 memoryState에 있다. 매 호출에 같은 상태 참조를 돌려줘야 하며,
// 상태가 바뀔 때 reducer가 새 배열을 만들어 React가 변경을 감지할 수 있게 한다.
function getSnapshot() {
  return memoryState;
}

// 닫힌 토스트는 퇴장 애니메이션이 끝난 뒤 목록에서 제거한다.
// 같은 토스트에 제거 타이머가 중복 등록되지 않도록 Map으로 추적한다.
function addToRemoveQueue(toastId: string) {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ type: "REMOVE_TOAST", toastId });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
}

function dismissToast(toastId?: string) {
  const toastsToDismiss = toastId === undefined ? memoryState : memoryState.filter((toast) => toast.id === toastId);

  // toastId가 없으면 현재 표시 중인 토스트 전체를 닫고, 있으면 해당 토스트만 닫는다.
  toastsToDismiss.forEach((toast) => {
    addToRemoveQueue(toast.id);
  });

  // Radix Toast의 open을 false로 바꿔 닫힘/퇴장 애니메이션을 시작한다.
  dispatch({ type: "DISMISS_TOAST", toastId });
}

type ToastHandle = {
  id: string;
  dismiss: () => void;
  update: (props: Partial<ToastInput>) => void;
};

/**
 * 토스트를 생성하고 해당 토스트만 조작할 수 있는 핸들을 돌려준다.
 * 반환된 핸들의 dismiss/update는 이 토스트 ID만 대상으로 한다.
 */
function toast(props: ToastInput): ToastHandle {
  const id = genId();

  const update = (props: Partial<ToastInput>) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });
  const dismiss = () => dismissToast(id);

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id,
    dismiss,
    update,
  };
}

function useToast() {
  // useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)의 기본 흐름:
  // 1) React가 subscribe에 알림 함수를 전달해 구독을 시작한다.
  // 2) 저장소 변경 시 알림 함수를 호출하여 React 에게 알린다.
  // 3) React가 getSnapshot을 다시 실행해 새 값을 읽고 컴포넌트를 업데이트한다.
  // 이 알림 함수는 앱에서 직접 만들거나 상태를 인자로 전달받는 함수가 아니다.
  //
  // 세 번째 인자(getSnapshot)은 서버 렌더링/하이드레이션에서 사용할 스냅샷 함수다.
  // 브라우저와 서버에서 이 예제의 저장소 값은 동일한 메모리 저장소를 읽는다.
  const toasts = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    toasts,
    toast,
    dismiss: dismissToast,
  };
}

export { useToast };
