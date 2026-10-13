import { describe, expect, it } from "@jest/globals";

import { sendCodeSchema, verifyCodeSchema } from "@/app/auth/schemas";

describe("인증 폼 스키마", () => {
  it("올바른 이메일은 허용하고 잘못된 이메일은 거부한다", () => {
    // 인증 절차를 시작하기 전에 이메일 주소 형식을 검증하는지 확인한다.
    expect(sendCodeSchema.safeParse({ email: "user@example.com" }).success).toBe(true);
    expect(sendCodeSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
  });

  it("인증 코드가 정확히 6자인지 확인한다", () => {
    // 6자보다 짧거나 긴 인증 코드를 거부하는지 확인한다.
    expect(verifyCodeSchema.safeParse({ code: "A1B2C3" }).success).toBe(true);
    expect(verifyCodeSchema.safeParse({ code: "12345" }).success).toBe(false);
    expect(verifyCodeSchema.safeParse({ code: "1234567" }).success).toBe(false);
  });
});
