import { Request, Router } from "express";
import { db } from "../config/firebase";
import { authMiddleware } from "../middleware/auth";
import { authService } from "../services/auth";

const router = Router();

// 회원가입
router.post("/register", async (req, res) => {
  try {
    const { email, password, nickname } = req.body;
    const { user, accessToken, refreshToken } = await authService.register(
      email,
      password,
      nickname
    );

    res.json({ user, accessToken, refreshToken });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 로그인
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(
      email,
      password
    );

    res.json({ user, accessToken, refreshToken });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 토큰 갱신
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token" });
    }

    // Refresh Token 검증
    const decoded = authService.verifyRefreshToken(refreshToken);

    // 사용자 정보 조회
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    if (!userDoc.exists) {
      return res.status(401).json({ error: "User not found" });
    }

    const user = {
      id: userDoc.id,
      email: userDoc.data()?.email,
      nickname: userDoc.data()?.nickname,
      isOnline: true,
    };

    // 새로운 Access Token 발급
    const accessToken = authService.generateAccessToken(user);

    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

// 로그아웃
router.post("/logout", authMiddleware, async (req: Request, res) => {
  try {
    const { uid } = req.user!;
    // Refresh Token 삭제
    authService.removeRefreshToken(uid);

    // 쿠키 삭제
    res.clearCookie("refreshToken");

    // 사용자 상태 업데이트
    await db.collection("users").doc(uid).update({
      isOnline: false,
      lastSeen: new Date(),
    });

    res.json({ message: "Logged out successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 내 정보 조회
router.get("/me", authMiddleware, async (req: Request, res) => {
  try {
    const { uid } = req.user!;
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();
    res.json({
      id: userDoc.id,
      email: userData?.email,
      nickname: userData?.nickname,
      isOnline: userData?.isOnline,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
