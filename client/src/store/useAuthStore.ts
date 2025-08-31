import { socketClient } from "@/lib/socket";
import { UserRs } from "@/rqrs/auth/userRs";
import { removeAccessToken, setAccessToken } from "@/util/token";
import { create } from "zustand";

interface AuthState {
  user: UserRs | null;
  accessToken: string | null;
  isAuthReady: boolean;

  // 초기화
  initialize: (user: UserRs, accessToken: string) => void;
  // 로그인
  login: (user: UserRs, accessToken: string) => void;
  // 로그아웃
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthReady: false,

  initialize: (user: UserRs, accessToken: string) => {
    set({
      user,
      accessToken,
    });

    socketClient.connect();

    set({ isAuthReady: true });
  },

  login: (user: UserRs, accessToken: string) => {
    setAccessToken(accessToken);

    // 상태 업데이트
    set({
      user,
      accessToken,
    });
  },

  logout: () => {
    // 로그아웃 성공 시 쿠키에서 액세스 토큰 삭제
    removeAccessToken();

    set({
      user: null,
      accessToken: null,
      isAuthReady: false,
    });

    // 소켓 연결 해제
    socketClient.disconnect();
  },

  setAccessToken: (accessToken: string | null) =>
    set((state) => ({
      ...state,
      accessToken,
    })),
}));
