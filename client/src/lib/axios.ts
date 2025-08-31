import {
  getAccessToken,
  removeAccessToken,
  setAccessToken,
} from "@/util/token";
import axios, { AxiosInstance } from "axios";

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

class HttpClient {
  private static instance: HttpClient;
  private api: AxiosInstance;
  private refreshing: boolean = false;
  private refreshSubscribers: ((token: string) => void)[] = [];
  private readonly API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  private constructor() {
    this.api = axios.create({
      baseURL: this.API_URL,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  public static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  private setupInterceptors(): void {
    // 요청 인터셉터 - Access Token 추가
    this.api.interceptors.request.use(
      (config) => {
        const accessToken = getAccessToken();
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터 - 토큰 갱신 처리
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Access Token이 없거나 만료된 경우 refresh 시도
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.refreshing) {
            // 토큰 갱신 중이면 대기
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.api(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.refreshing = true;

          try {
            const token = await this.refreshAccessToken();
            if (token) {
              // 대기 중인 요청들 처리
              this.onRefreshSuccess(token);
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.api(originalRequest);
            }
          } catch (error) {
            this.onRefreshFailure();
            return Promise.reject(error);
          } finally {
            this.refreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<string | null> {
    try {
      // 서버에서 httpOnly 쿠키의 refreshToken을 사용
      const response = await this.api.post<TokenResponse>("/auth/refresh");

      const { accessToken } = response.data;
      setAccessToken(accessToken);
      return accessToken;
    } catch {
      this.handleUnauthorized();
      return null;
    }
  }

  private onRefreshSuccess(token: string): void {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private onRefreshFailure(): void {
    this.refreshSubscribers = [];
    this.handleUnauthorized();
  }

  private handleUnauthorized(): void {
    removeAccessToken();
    window.location.href = "/login";
  }

  // API 메서드들
  public get<T>(url: string, config = {}) {
    return this.api.get<T>(url, config);
  }

  public post<T>(url: string, data = {}, config = {}) {
    return this.api.post<T>(url, data, config);
  }

  public put<T>(url: string, data = {}, config = {}) {
    return this.api.put<T>(url, data, config);
  }

  public delete<T>(url: string, config = {}) {
    return this.api.delete<T>(url, config);
  }

  public patch<T>(url: string, data = {}, config = {}) {
    return this.api.patch<T>(url, data, config);
  }
}

export const httpClient = HttpClient.getInstance();
