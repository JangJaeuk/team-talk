import { connectSocket, disconnectSocket } from "@/lib/socket";
import { User } from "@/types";
import { create } from "zustand";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // 액션
  login: (nickname: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: (nickname: string) => {
    try {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9), // 임시 ID 생성
        nickname,
        status: "online",
      };

      set({ user: newUser, isAuthenticated: true, error: null });
      connectSocket(); // 소켓 연결
    } catch (error) {
      set({ error: "로그인 중 오류가 발생했습니다." });
    }
  },

  logout: () => {
    disconnectSocket(); // 소켓 연결 해제
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  setError: (error) => {
    set({ error });
  },
}));
