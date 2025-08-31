import { httpClient } from "@/lib/axios";
import { socketClient } from "@/lib/socket";
import { User } from "@/type";
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
  logout: (onSuccess?: () => void) => Promise<void>;
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

      if (!token) {
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

      const { user, accessToken } = response.data;

      // Access Token 쿠키에 저장
      Cookies.set("accessToken", accessToken, {
        path: "/",
        expires: 14, // 14일
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

  logout: async (onSuccess?: () => void) => {
    try {
      await httpClient.post("/auth/logout");

      // 로그아웃 성공 시 쿠키에서 액세스 토큰 삭제
      Cookies.remove("accessToken", {
        path: "/",
      });

      // 로그인 페이지로 이동 (미들웨어가 이제 허용함)
      onSuccess?.();

      setTimeout(() => {
        // 상태 초기화
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          error: null,
        });

        // 소켓 연결 해제
        socketClient.disconnect();
      }, 200);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        set({ error: error.response.data.error });
      } else {
        set({ error: "로그아웃 중 오류가 발생했습니다." });
      }
      throw error;
    }
  },

  setError: (error: string | null) => set({ error }),

  setAccessToken: (accessToken: string | null) =>
    set((state) => ({
      ...state,
      accessToken,
      isAuthenticated: !!accessToken,
    })),
}));
