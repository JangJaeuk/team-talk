import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  // 추후 필요한 설정들 추가
} as const;
