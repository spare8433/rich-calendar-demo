import { type ClassValue, clsx } from "clsx";
import dayjs from "dayjs";
import { CSSProperties } from "react";
import { twMerge } from "tailwind-merge";

import { FREQUENCY } from "@/constants";

// 조건부 클래스 목록을 문자열로 합치고, 서로 충돌하는 Tailwind 클래스는 뒤의 값으로 정리한다.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ScheduleColorVariable extends CSSProperties {
  "--schedule-background": string;
  "--schedule": string;
}

// 일정 색상 토큰을 일정 배경색과 전경색에 연결할 CSS 변수로 변환한다.
export const getScheduleColorVariable: (color: ColorType) => ScheduleColorVariable = (color) => {
  return {
    "--schedule-background": `var(--${color}-background)`,
    "--schedule": `var(--${color})`,
  };
};

interface RepeatParam {
  endDate: string;
  repeatInterval: number;
  repeatEndCount: number;
  repeatFrequency: RepeatFrequencyType;
}

// 반복 간격과 반복 횟수를 적용해 마지막 반복 일정의 종료 시각을 계산한다.
export const calculateRepeatEndDate = (repeatParam: RepeatParam) => {
  const { endDate, repeatInterval, repeatEndCount, repeatFrequency } = repeatParam;
  return dayjs(endDate)
    .add(repeatInterval * repeatEndCount, FREQUENCY[repeatFrequency])
    .toISOString();
};

interface DateRangeParam {
  beforeStartAt: string;
  beforeEndAt: string;
  startAt: string;
  endAt: string;
}

// 일정 시작/종료 시각이 이전 값에서 각각 얼마나 이동했는지 밀리초 단위로 계산한다.
export const calculateDateRangeDiff = (dateRangeParam: DateRangeParam) => {
  const { startAt, endAt, beforeStartAt, beforeEndAt } = dateRangeParam;
  const startDiffMs = dayjs(startAt).diff(dayjs(beforeStartAt));
  const endDiffMs = dayjs(endAt).diff(dayjs(beforeEndAt));

  return { startDiffMs, endDiffMs };
};

// 이메일 인증 등에 사용할 영문 대문자와 숫자 조합의 6자리 코드를 생성한다.
export default function generateCode(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // 대문자 + 숫자
  let result = "";

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length); // 랜덤 인덱스 생성
    result += characters[randomIndex]; // 랜덤 문자 추가
  }

  return result;
}
