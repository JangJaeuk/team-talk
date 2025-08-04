import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../config/firebase";
import { User } from "../types";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const SALT_ROUNDS = 10;

export const authService = {
  // 사용자 등록
  async register(
    email: string,
    password: string,
    nickname: string
  ): Promise<{ user: User; token: string }> {
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

      // 사용자 생성
      const userDoc = await db.collection("users").add({
        email,
        password: hashedPassword,
        nickname,
        isOnline: true,
        lastSeen: new Date(),
      });

      const user: User = {
        id: userDoc.id,
        email,
        nickname,
        isOnline: true,
      };

      // JWT 토큰 생성
      const token = this.generateToken(user);

      return { user, token };
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  },

  // 로그인
  async login(
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> {
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
      };

      // 온라인 상태 업데이트
      await userDoc.ref.update({
        isOnline: true,
        lastSeen: new Date(),
      });

      // JWT 토큰 생성
      const token = this.generateToken(user);

      return { user, token };
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  },

  // JWT 토큰 생성
  generateToken(user: User): string {
    return jwt.sign(
      {
        uid: user.id,
        email: user.email,
        nickname: user.nickname,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
  },

  // 토큰 검증
  verifyToken(token: string): jwt.JwtPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded as jwt.JwtPayload;
    } catch (error) {
      throw new Error("Invalid token");
    }
  },
};
