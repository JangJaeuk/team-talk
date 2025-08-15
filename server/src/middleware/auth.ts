import { NextFunction, Request, Response } from "express";
import { authService } from "../services/auth";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const accessToken = authHeader.split("Bearer ")[1];
    const decoded = authService.verifyAccessToken(accessToken);

    // 요청 객체에 사용자 정보 추가
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      nickname: decoded.nickname,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Invalid access token" });
  }
};
