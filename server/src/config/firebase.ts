import * as admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Firebase Admin SDK 초기화
const app = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

// Firestore 인스턴스 가져오기
export const db = getFirestore(app);

// Auth 인스턴스 가져오기
export const auth = getAuth(app);

export default app;
