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

    const rooms = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as ChatRoom)
    );

    // 각 방의 최신 메시지 가져오기
    const roomsWithLastMessage = await Promise.all(
      rooms.map(async (room) => {
        const messageSnapshot = await db
          .collection("messages")
          .where("roomId", "==", room.id)
          .orderBy("createdAt", "desc")
          .limit(1)
          .get();

        const lastMessage = messageSnapshot.docs[0]
          ? ({
              id: messageSnapshot.docs[0].id,
              ...messageSnapshot.docs[0].data(),
            } as Message)
          : null;

        return {
          ...room,
          lastMessage,
        };
      })
    );

    return roomsWithLastMessage;
  },

  // 단일 채팅방 조회
  async getRoom(roomId: string): Promise<ChatRoom | null> {
    const doc = await db.collection("rooms").doc(roomId).get();

    if (!doc.exists) {
      return null;
    }

    // 현재 활성 사용자 목록 가져오기
    const usersSnapshot = await db
      .collection("users")
      .where("isOnline", "==", true)
      .get();

    const participants = usersSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as User)
    );

    return {
      id: doc.id,
      ...doc.data(),
      participants,
    } as ChatRoom;
  },

  // 채팅방 참여자 수 업데이트
  async updateParticipantCount(roomId: string, delta: number): Promise<void> {
    const roomRef = db.collection("rooms").doc(roomId);

    // 방이 존재하는지 먼저 확인
    const roomDoc = await roomRef.get();
    if (!roomDoc.exists) {
      console.log(`Room ${roomId} does not exist`);
      return; // 방이 없으면 조용히 리턴
    }

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

  async getMessages(
    roomId: string,
    limit: number = 30,
    lastMessageId?: string
  ) {
    try {
      let query = db
        .collection("messages")
        .where("roomId", "==", roomId)
        .orderBy("createdAt", "desc")
        .orderBy("__name__", "desc");

      if (lastMessageId) {
        const lastDoc = await db
          .collection("messages")
          .doc(lastMessageId)
          .get();
        if (lastDoc.exists) {
          const lastDocData = lastDoc.data();
          query = query.startAfter(lastDocData?.createdAt, lastDoc.id);
        }
      }

      // 실제로 요청한 것보다 1개 더 많은 문서를 가져와서 다음 페이지 존재 여부 확인
      const snapshot = await query.limit(limit + 1).get();
      const messages = snapshot.docs.slice(0, limit).map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // limit + 1개의 문서가 있다면 다음 페이지가 존재
      const hasNextPage = snapshot.docs.length > limit;

      return {
        messages,
        hasNextPage,
      };
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
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
