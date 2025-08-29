import { db } from "../config/firebase";
import { ChatRoom, Message, User } from "../types";

// Firestore 타임스탬프를 Date로 변환
const convertToDate = (timestamp: {
  _seconds: number;
  _nanoseconds: number;
}): Date => {
  return new Date(
    timestamp._seconds * 1000 + (timestamp._nanoseconds || 0) / 1000000
  );
};

// 채팅방 관련 서비스
export const roomService = {
  // 채팅방 생성
  async createRoom(room: Omit<ChatRoom, "id" | "createdAt">): Promise<string> {
    const docRef = await db.collection("rooms").add({
      ...room,
      createdAt: new Date(),
    });
    return docRef.id;
  },

  // 참여중인 채팅방 목록 조회
  async getJoinedRooms(userId?: string): Promise<ChatRoom[]> {
    if (!userId) {
      throw new Error("유저 ID가 필요합니다.");
    }

    try {
      const snapshot = await db
        .collection("rooms")
        .where("participants", "array-contains", userId)
        .orderBy("createdAt", "desc")
        .get();

      const rooms = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: convertToDate(data.createdAt),
        } as ChatRoom;
      });

      // 각 방의 최신 메시지와 읽지 않은 메시지 수 가져오기
      const roomsWithDetails = await Promise.all(
        rooms.map(async (room) => {
          // 최신 메시지 가져오기
          const messageSnapshot = await db
            .collection("messages")
            .where("roomId", "==", room.id)
            .orderBy("createdAt", "desc")
            .limit(1)
            .get();

          const lastMessage = messageSnapshot.docs[0]
            ? (() => {
                const data = messageSnapshot.docs[0].data();
                return {
                  id: messageSnapshot.docs[0].id,
                  ...data,
                  createdAt: convertToDate(data.createdAt),
                } as Message;
              })()
            : null;

          // 읽지 않은 메시지 수 계산
          let unreadCount = 0;
          if (userId) {
            const messagesSnapshot = await db
              .collection("messages")
              .where("roomId", "==", room.id)
              .orderBy("createdAt", "desc")
              .get();

            // 사용자가 읽지 않은 메시지 수 계산
            unreadCount = messagesSnapshot.docs.filter((doc) => {
              const message = doc.data();
              return !message.readBy?.some(
                (read: { userId: string }) => read.userId === userId
              );
            }).length;
          }

          return {
            ...room,
            lastMessage,
            unreadCount,
          };
        })
      );

      // 최신 메시지 시간 순으로 정렬
      roomsWithDetails.sort((a, b) => {
        const aTime = (a.lastMessage?.createdAt as any)?._seconds || 0;
        const bTime = (b.lastMessage?.createdAt as any)?._seconds || 0;
        return bTime - aTime;
      });

      return roomsWithDetails;
    } catch (error) {
      throw new Error(
        `참여 중인 채팅방 목록 조회 실패: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  },

  // 참여 가능한 채팅방 목록 조회
  async getAvailableRooms(
    userId: string,
    searchQuery?: string,
    lastRoomId?: string,
    limit: number = 20
  ): Promise<{ rooms: ChatRoom[]; hasNextPage: boolean }> {
    // 사용자가 참여 중인 방 ID 목록 조회
    const joinedSnapshot = await db
      .collection("rooms")
      .where("participants", "array-contains", userId)
      .get();
    const joinedRoomIds = joinedSnapshot.docs.map((doc) => doc.id);

    // 기본 쿼리 설정
    let query: FirebaseFirestore.Query = searchQuery
      ? db
          .collection("rooms")
          .orderBy("name")
          .startAt(searchQuery.toLowerCase())
          .endAt(searchQuery.toLowerCase() + "\uf8ff")
      : db.collection("rooms").orderBy("createdAt", "desc");

    // 이전 마지막 문서 이후부터 조회
    if (lastRoomId) {
      const lastDoc = await db.collection("rooms").doc(lastRoomId).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }

    // limit + 1개를 조회하여 다음 페이지 존재 여부 확인
    const availableSnapshot = await query.limit(limit + 1).get();

    const rooms = availableSnapshot.docs
      .slice(0, limit) // 실제로는 limit 개수만큼만 사용
      .filter((doc) => !joinedRoomIds.includes(doc.id))
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: convertToDate(data.createdAt),
        } as ChatRoom;
      });

    const hasNextPage = availableSnapshot.docs.length > limit;

    // 각 방의 최신 메시지와 참여자 수 정보 추가
    const roomsWithDetails = await Promise.all(
      rooms.map(async (room) => {
        // 최신 메시지 가져오기
        const messageSnapshot = await db
          .collection("messages")
          .where("roomId", "==", room.id)
          .orderBy("createdAt", "desc")
          .limit(1)
          .get();

        const lastMessage = messageSnapshot.docs[0]
          ? (() => {
              const data = messageSnapshot.docs[0].data();
              return {
                id: messageSnapshot.docs[0].id,
                ...data,
                createdAt: convertToDate(data.createdAt),
              } as Message;
            })()
          : null;

        return {
          ...room,
          lastMessage,
          participantCount: room.participants.length,
        };
      })
    );

    // 최신 메시지 시간 순으로 정렬
    roomsWithDetails.sort((a, b) => {
      const aTime = (a.lastMessage?.createdAt as any)?._seconds || 0;
      const bTime = (b.lastMessage?.createdAt as any)?._seconds || 0;
      return bTime - aTime;
    });

    return {
      rooms: roomsWithDetails,
      hasNextPage,
    };
  },

  // 단일 채팅방 조회
  async getRoom(roomId: string): Promise<ChatRoom | null> {
    const doc = await db.collection("rooms").doc(roomId).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data() as unknown as ChatRoom;

    return {
      ...data,
      id: doc.id,
      participants: data.participants || [], // 방의 실제 참여자 목록 사용
    } as ChatRoom;
  },

  // 채팅방 삭제
  async deleteRoom(roomId: string): Promise<void> {
    await db.collection("rooms").doc(roomId).delete();
  },

  // 채팅방 참여
  async joinRoom(roomId: string, userId: string): Promise<ChatRoom> {
    const roomRef = db.collection("rooms").doc(roomId);

    await db.runTransaction(async (transaction) => {
      const room = await transaction.get(roomRef);
      if (!room.exists) {
        throw new Error("Room not found");
      }

      const data = room.data();
      if (!data) {
        throw new Error("Room data not found");
      }

      if (data.participants.includes(userId)) {
        throw new Error("User already joined this room");
      }

      transaction.update(roomRef, {
        participants: [...data.participants, userId],
      });
    });

    // 업데이트된 방 정보 반환
    const updatedRoom = await this.getRoom(roomId);
    if (!updatedRoom) {
      throw new Error("Failed to get updated room");
    }
    return updatedRoom;
  },

  // 채팅방 나가기
  async leaveRoom(roomId: string, userId: string): Promise<ChatRoom> {
    const roomRef = db.collection("rooms").doc(roomId);

    await db.runTransaction(async (transaction) => {
      const room = await transaction.get(roomRef);
      if (!room.exists) {
        throw new Error("Room not found");
      }

      const data = room.data();
      if (!data) {
        throw new Error("Room data not found");
      }

      if (!data.participants.includes(userId)) {
        throw new Error("User is not in this room");
      }

      transaction.update(roomRef, {
        participants: data.participants.filter((id: string) => id !== userId),
      });
    });

    // 업데이트된 방 정보 반환
    const updatedRoom = await this.getRoom(roomId);
    if (!updatedRoom) {
      throw new Error("Failed to get updated room");
    }
    return updatedRoom;
  },
};

// 메시지 관련 서비스
export const messageService = {
  // 메시지 저장
  async createMessage(
    message: Omit<Message, "id" | "createdAt" | "isEdited" | "readBy">
  ): Promise<string> {
    const docRef = await db.collection("messages").add({
      ...message,
      createdAt: new Date(),
      isEdited: false,
      readBy: [],
    });
    return docRef.id;
  },

  // 단일 메시지 조회
  async getMessage(messageId: string): Promise<Message | null> {
    const doc = await db.collection("messages").doc(messageId).get();
    if (!doc.exists) {
      return null;
    }
    return {
      id: doc.id,
      ...doc.data(),
    } as Message;
  },

  // 메시지 읽음 상태 업데이트
  async markMessageAsRead(
    messageId: string,
    userId: string
  ): Promise<Message["readBy"]> {
    const messageRef = db.collection("messages").doc(messageId);
    let updatedReadBy: Message["readBy"] = [];

    await db.runTransaction(async (transaction) => {
      const messageDoc = await transaction.get(messageRef);
      if (!messageDoc.exists) {
        throw new Error("Message not found");
      }

      const messageData = messageDoc.data() as Message;
      const currentReadBy = messageData.readBy || [];

      // 이미 읽음 처리가 되어 있지 않은 경우에만 추가
      if (!currentReadBy.some((read) => read.userId === userId)) {
        const readAt = new Date();
        updatedReadBy = [
          ...currentReadBy,
          {
            userId,
            readAt,
          },
        ];

        transaction.update(messageRef, {
          readBy: updatedReadBy,
        });
      } else {
        updatedReadBy = currentReadBy;
      }
    });

    return updatedReadBy;
  },

  // 특정 방의 메시지 목록 조회
  async getMessagesByRoom(roomId: string): Promise<Message[]> {
    const snapshot = await db
      .collection("messages")
      .where("roomId", "==", roomId)
      .orderBy("createdAt", "asc")
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: convertToDate(data.createdAt),
        readBy: (data.readBy || []).map((read: any) => ({
          ...read,
          readAt: convertToDate(read.readAt),
        })),
      } as Message;
    });
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
      const messages = snapshot.docs.slice(0, limit).map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: convertToDate(data.createdAt),
          readBy: (data.readBy || []).map((read: any) => ({
            ...read,
            readAt: convertToDate(read.readAt),
          })),
        } as Message;
      });

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
