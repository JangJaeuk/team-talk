import axios, { AxiosInstance } from "axios";

class HttpClient {
  private static instance: HttpClient;
  private api: AxiosInstance;
  private readonly API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  private constructor() {
    this.api = axios.create({
      baseURL: this.API_URL,
      headers: {
        "Content-Type": "application/json",
      },
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
    // 요청 인터셉터 - 토큰 추가
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터 - 401 에러 처리
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | undefined {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
  }

  private handleUnauthorized(): void {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    window.location.href = "/";
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
