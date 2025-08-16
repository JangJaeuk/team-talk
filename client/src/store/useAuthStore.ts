import { httpClient } from "@/lib/axios";
import { socketClient } from "@/lib/socket";
import { User } from "@/types";
import axios from "axios";
import Cookies from "js-cookie";
import { create } from "zustand";

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  error: string | null;

  // 초기화
  initialize: () => Promise<void>;
  // 회원가입
  register: (
    email: string,
    password: string,
    nickname: string
  ) => Promise<void>;
  // 로그인
  login: (email: string, password: string) => Promise<void>;
  // 로그아웃
  logout: () => void;
  // 에러 설정
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  error: null,

  initialize: async () => {
    try {
      const token = Cookies.get("accessToken");
      console.log("Token from cookies:", token);
      if (!token) {
        console.log("No token found, returning");
        return;
      }

      // 소켓 연결 초기화
      try {
        await socketClient.connect();
      } catch (error) {
        console.error("Socket connection failed:", error);
        // 소켓 연결 실패 시 로그아웃 처리
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          error: null,
        });
        return;
      }

      // Access Token으로 사용자 정보 요청
      const response = await httpClient.get<User>("/auth/me");
      const user = response.data;

      set({
        user,
        accessToken: token,
        isAuthenticated: true,
        error: null,
      });
    } catch (error) {
      // 토큰이 유효하지 않으면 로그아웃
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  register: async (email: string, password: string, nickname: string) => {
    try {
      await httpClient.post("/auth/register", {
        email,
        password,
        nickname,
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        set({ error: error.response.data.error });
      } else {
        set({ error: "회원가입 중 오류가 발생했습니다." });
      }
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await httpClient.post<TokenResponse>("/auth/login", {
        email,
        password,
      });

      const { user, accessToken, refreshToken } = response.data;

      // Access Token과 Refresh Token을 쿠키에 저장
      Cookies.set("accessToken", accessToken, {
        path: "/",
        secure: true,
        sameSite: "none",
      });
      Cookies.set("refreshToken", refreshToken, {
        path: "/",
        secure: true,
        sameSite: "none",
        // 14일
        expires: 14,
      });

      // 상태 업데이트
      set({
        user,
        accessToken,
        isAuthenticated: true,
        error: null,
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        set({ error: error.response.data.error });
      } else {
        set({ error: "로그인 중 오류가 발생했습니다." });
      }
      throw error;
    }
  },

  logout: () => {
    // Access Token과 Refresh Token 제거
    Cookies.remove("accessToken", { path: "/" });
    Cookies.remove("refreshToken", { path: "/" });

    // 서버에 로그아웃 알림
    httpClient.post("/auth/logout");

    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      error: null,
    });
  },

  setError: (error: string | null) => set({ error }),

  setAccessToken: (accessToken: string | null) =>
    set((state) => ({
      ...state,
      accessToken,
      isAuthenticated: !!accessToken,
    })),
}));
