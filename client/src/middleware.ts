import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// 인증이 필요한 경로들
const protectedRoutes = ["/rooms"];
// 비로그인 상태에서만 접근 가능한 경로들
const authRoutes = ["/login"];

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  // 인증이 필요한 페이지에 접근하려고 할 때
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!accessToken) {
      // 로그인 페이지로 리다이렉트
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 로그인 페이지에 이미 로그인된 상태로 접근하려고 할 때
  if (authRoutes.includes(pathname)) {
    if (accessToken) {
      // 채팅방 목록 페이지로 리다이렉트
      return NextResponse.redirect(new URL("/rooms", request.url));
    }
  }

  // 루트 경로로 접근할 때
  if (pathname === "/") {
    if (accessToken) {
      // 로그인된 상태면 채팅방 목록으로
      return NextResponse.redirect(new URL("/rooms", request.url));
    } else {
      // 로그인되지 않은 상태면 로그인 페이지로
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/rooms/:path*"],
};
