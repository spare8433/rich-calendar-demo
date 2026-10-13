/** @jest-environment node */

import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("next/headers", () => ({ cookies: jest.fn() }));
jest.mock("next/navigation", () => ({
  redirect: jest.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
}));
jest.mock("uuid", () => ({ v4: jest.fn(() => "generated-token") }));

const { cookies } = require("next/headers") as typeof import("next/headers");
const { redirect } = require("next/navigation") as typeof import("next/navigation");
const { v4: uuidv4 } = require("uuid") as typeof import("uuid");
const { login, logout } = require("./actions") as typeof import("@/actions");

describe("인증 서버 액션", () => {
  const cookieStore = { delete: jest.fn(), set: jest.fn() };

  beforeEach(() => {
    jest.mocked(cookies).mockResolvedValue(cookieStore as unknown as Awaited<ReturnType<typeof cookies>>);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("로그인 페이지로 이동하기 전에 토큰 쿠키를 삭제한다", async () => {
    // 로그아웃 시 세션 쿠키를 지운 뒤 로그인 경로로 이동하는지 확인한다.
    // redirect 의 경우 에러를 throw 하며 처리되는 방식이므로 .rejects 사용
    await expect(logout()).rejects.toThrow("NEXT_REDIRECT:/auth/login");

    expect(cookieStore.delete).toHaveBeenCalledWith("token");
    expect(jest.mocked(redirect)).toHaveBeenCalledWith("/auth/login");
  });

  it("생성한 토큰 쿠키를 저장한 뒤 앱 루트로 이동한다", async () => {
    // 로그인 시 새 토큰을 저장하고 인증된 사용자의 진입 경로로 이동하는지 확인한다.
    await expect(login()).rejects.toThrow("NEXT_REDIRECT:/");

    expect(jest.mocked(uuidv4)).toHaveBeenCalledTimes(1);
    expect(cookieStore.set).toHaveBeenCalledWith("token", "generated-token");
    expect(jest.mocked(redirect)).toHaveBeenCalledWith("/");
  });
});
