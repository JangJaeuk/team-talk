import * as admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
  : {};

// Firebase Admin SDK 초기화
const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

// Firestore 인스턴스 가져오기
const db = getFirestore(app);

// 개발 환경에서 에뮬레이터 연결
if (process.env.NODE_ENV === "development") {
  console.log("Connecting to Firestore emulator on localhost:9090");
  db.settings({
    host: "localhost:9090",
    ssl: false,
  });
}

export { db };

// Auth 인스턴스 가져오기
export const auth = getAuth(app);

export default app;
