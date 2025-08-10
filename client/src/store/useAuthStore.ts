import { httpClient } from "@/lib/axios";
import { User } from "@/types";
import axios from "axios";
import Cookies from "js-cookie";
import { create } from "zustand";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface AuthState {
  user: User | null;
  token: string | null;
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
  token: null,
  isAuthenticated: false,
  error: null,

  initialize: async () => {
    console.log("Initialize function called");
    try {
      const token = Cookies.get("token");
      console.log("Token from cookies:", token);
      if (!token) {
        console.log("No token found, returning");
        return;
      }

      // 토큰을 상태에 먼저 설정
      set({ token });
      console.log("Token set to state");

      // 토큰을 헤더에 포함시켜 사용자 정보 요청
      console.log("Fetching user info");
      const response = await httpClient.get<User>("/auth/me");
      const user = response.data;
      console.log("User info received:", user);

      set({
        user,
        token,
        isAuthenticated: true,
        error: null,
      });
      console.log("Auth state updated with user info");
    } catch (error) {
      console.error("Initialize error:", error);
      // 토큰이 유효하지 않으면 로그아웃
      Cookies.remove("token");
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  register: async (email: string, password: string, nickname: string) => {
    try {
      await axios.post(`${API_URL}/auth/register`, {
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
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { user, token } = response.data;

      // 토큰을 쿠키에 저장 (7일 유효)
      Cookies.set("token", token, { expires: 7 });

      set({
        user,
        token,
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
    // 쿠키에서 토큰 제거
    Cookies.remove("token");

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  setError: (error: string | null) => set({ error }),
}));
