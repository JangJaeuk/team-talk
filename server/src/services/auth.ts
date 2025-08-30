import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../config/firebase";
import {
  ACCESS_TOKEN_EXPIRES_NUMBER,
  REFRESH_TOKEN_EXPIRES_NUMBER,
} from "../constants/auth";
import { User } from "../types";

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "access-token-secret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "refresh-token-secret";
const SALT_ROUNDS = 10;

// 토큰 만료 시간 설정
const ACCESS_TOKEN_EXPIRES_IN = `${ACCESS_TOKEN_EXPIRES_NUMBER}m`;
const REFRESH_TOKEN_EXPIRES_IN = `${REFRESH_TOKEN_EXPIRES_NUMBER}d`;

// JWT 기반 인증만 사용

export const authService = {
  // 사용자 등록
  async register(
    email: string,
    password: string,
    nickname: string
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    try {
      // 이메일 중복 체크
      const existingUser = await db
        .collection("users")
        .where("email", "==", email)
        .get();

      if (!existingUser.empty) {
        throw new Error("Email already exists");
      }

      // 비밀번호 해싱
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // 랜덤 아바타 선택
      const avatarNumber = Math.floor(Math.random() * 5) + 1;
      const avatar = `avatar${avatarNumber}`;

      // 사용자 생성
      const userDoc = await db.collection("users").add({
        email,
        password: hashedPassword,
        nickname,
        isOnline: true,
        lastSeen: new Date(),
        avatar,
      });

      const user: User = {
        id: userDoc.id,
        email,
        nickname,
        isOnline: true,
        avatar,
      };

      // Access Token과 Refresh Token 생성
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      return { user, accessToken, refreshToken };
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  },

  // 로그인
  async login(
    email: string,
    password: string
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    try {
      // 사용자 찾기
      const userSnapshot = await db
        .collection("users")
        .where("email", "==", email)
        .get();

      if (userSnapshot.empty) {
        throw new Error("User not found");
      }

      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();

      // 비밀번호 검증
      const isPasswordValid = await bcrypt.compare(password, userData.password);
      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }

      const user: User = {
        id: userDoc.id,
        email: userData.email,
        nickname: userData.nickname,
        isOnline: true,
        avatar: userData.avatar,
      };

      // 온라인 상태 업데이트
      await userDoc.ref.update({
        isOnline: true,
        lastSeen: new Date(),
      });

      // Access Token과 Refresh Token 생성
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      return { user, accessToken, refreshToken };
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  },

  // Access Token 생성
  generateAccessToken(user: User): string {
    return jwt.sign(
      {
        uid: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        type: "access",
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );
  },

  // Refresh Token 생성
  generateRefreshToken(user: User): string {
    return jwt.sign(
      {
        uid: user.id,
        type: "refresh",
      },
      REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );
  },

  // Access Token 검증
  verifyAccessToken(token: string): jwt.JwtPayload {
    try {
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as jwt.JwtPayload;
      if (decoded.type !== "access") {
        throw new Error("Invalid token type");
      }
      return decoded;
    } catch (error) {
      throw new Error("Invalid access token");
    }
  },

  // Refresh Token 검증
  verifyRefreshToken(token: string): jwt.JwtPayload {
    try {
      const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as jwt.JwtPayload;
      if (decoded.type !== "refresh") {
        throw new Error("Invalid token type");
      }

      // JWT 검증만 수행

      return decoded;
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  },

  // Refresh Token 삭제 (클라이언트에서 쿠키 삭제)
  removeRefreshToken(userId: string): void {
    // 저장소 없이 JWT만 사용하므로 서버에서는 별도 처리 없음
  },
};
