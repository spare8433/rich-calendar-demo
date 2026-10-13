/** @jest-environment node */

import { describe, expect, it } from "@jest/globals";
import { NextRequest } from "next/server";

import { middleware } from "@/middleware";

describe("경로 미들웨어", () => {
  it("토큰이 없는 요청을 로그인 페이지로 이동시킨다", () => {
    // 인증 쿠키가 없으면 보호된 경로로 진입할 수 없는지 확인한다.
    const response = middleware(new NextRequest("http://localhost/schedules"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/auth/login");
  });

  it("인증된 사용자가 루트 경로에 접근하면 일정 페이지로 이동시킨다", () => {
    // 루트 경로가 인증된 사용자를 캘린더 페이지로 보내는지 확인한다.
    const request = new NextRequest("http://localhost/", { headers: { cookie: "token=session-token" } });
    const response = middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/schedules");
  });

  it("토큰이 있는 보호 경로 요청은 통과시킨다", () => {
    // 인증 토큰이 있으면 요청이 다음 처리 단계로 전달되는지 확인한다.
    const request = new NextRequest("http://localhost/schedules", {
      headers: { cookie: "token=session-token" },
    });

    expect(middleware(request).headers.get("x-middleware-next")).toBe("1");
  });
});
