"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export async function logout() {
  const cookie = await cookies();
  cookie.delete("token");
  redirect("/auth/login"); // redirect 의 경우 에러를 throw 하며 처리되는 방식
}

export async function login() {
  const cookie = await cookies();
  cookie.set("token", uuidv4());
  redirect("/");
}
