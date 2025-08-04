import * as admin from "firebase-admin";
import { db } from "../config/firebase";
import { ChatRoom, Message, User } from "../types";

// 채팅방 관련 서비스
export const roomService = {
  // 채팅방 생성
  async createRoom(
    room: Omit<ChatRoom, "id" | "createdAt" | "participantCount">
  ): Promise<string> {
    const docRef = await db.collection("rooms").add({
      ...room,
      createdAt: new Date(),
      participantCount: 0,
    });
    return docRef.id;
  },

  // 채팅방 목록 조회
  async getRooms(): Promise<ChatRoom[]> {
    const snapshot = await db
      .collection("rooms")
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as ChatRoom)
    );
  },

  // 채팅방 참여자 수 업데이트
  async updateParticipantCount(roomId: string, delta: number): Promise<void> {
    const roomRef = db.collection("rooms").doc(roomId);
    await roomRef.update({
      participantCount: admin.firestore.FieldValue.increment(delta),
    });
  },

  // 채팅방 삭제
  async deleteRoom(roomId: string): Promise<void> {
    await db.collection("rooms").doc(roomId).delete();
  },
};

// 메시지 관련 서비스
export const messageService = {
  // 메시지 저장
  async createMessage(
    message: Omit<Message, "id" | "createdAt" | "isEdited">
  ): Promise<string> {
    const docRef = await db.collection("messages").add({
      ...message,
      createdAt: new Date(),
      isEdited: false,
    });
    return docRef.id;
  },

  // 특정 방의 메시지 목록 조회
  async getMessagesByRoom(roomId: string): Promise<Message[]> {
    const snapshot = await db
      .collection("messages")
      .where("roomId", "==", roomId)
      .orderBy("createdAt", "asc")
      .get();

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Message)
    );
  },

  // 메시지 수정
  async updateMessage(messageId: string, content: string): Promise<void> {
    await db.collection("messages").doc(messageId).update({
      content,
      isEdited: true,
    });
  },

  // 메시지 삭제
  async deleteMessage(messageId: string): Promise<void> {
    await db.collection("messages").doc(messageId).delete();
  },
};

// 사용자 관련 서비스
export const userService = {
  // 사용자 생성/업데이트
  async upsertUser(user: User): Promise<void> {
    const userRef = db.collection("users").doc(user.id);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      await userRef.update({
        ...user,
        lastSeen: new Date(),
      });
    } else {
      await userRef.set({
        ...user,
        isOnline: true,
        lastSeen: new Date(),
      });
    }
  },

  // 사용자 상태 업데이트
  async updateUserStatus(userId: string, isOnline: boolean): Promise<void> {
    await db.collection("users").doc(userId).update({
      isOnline,
      lastSeen: new Date(),
    });
  },
};
