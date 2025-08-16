import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  corsOrigin: process.env.CLIENT_URL || "http://localhost:3000",
  cookieDomain: process.env.COOKIE_DOMAIN || "localhost",
  isDevelopment: process.env.NODE_ENV === "development",
} as const;
