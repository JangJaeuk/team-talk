import { socketClient } from "@/lib/socket";
import { ChatRoom, Message } from "@/types";
import { create } from "zustand";

interface ChatState {
  messages: Message[];
  currentRoom?: ChatRoom;
  typingUsers: { [userId: string]: boolean };
  isLoading: boolean;
  error: string | null;
  rooms: ChatRoom[];

  // 액션
  setCurrentRoom: (room: ChatRoom) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;
  setTypingStatus: (userId: string, isTyping: boolean) => void;
  clearMessages: () => void;
  setError: (error: string | null) => void;
  setRooms: (rooms: ChatRoom[]) => void;
  updateRoomOrder: (roomId: string) => void;
  markRoomAsRead: (roomId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  currentRoom: undefined,
  typingUsers: {},
  isLoading: false,
  error: null,
  rooms: [],

  setCurrentRoom: (room) => {
    set({ currentRoom: room });
  },

  addMessage: (message) => {
    console.log("Adding message to store:", message);
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: message.id || Date.now().toString(),
        },
      ],
    }));
  },

  updateMessage: (messageId, content) => {
    const currentRoom = get().currentRoom;
    if (!currentRoom) return;

    socketClient.emitSocket("message:update", messageId, content);

    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId
          ? { ...msg, content, updatedAt: new Date(), isEdited: true }
          : msg
      ),
    }));
  },

  deleteMessage: (messageId) => {
    const currentRoom = get().currentRoom;
    if (!currentRoom) return;

    socketClient.emitSocket("message:delete", messageId);

    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== messageId),
    }));
  },

  setTypingStatus: (userId, isTyping) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [userId]: isTyping,
      },
    }));
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  setError: (error) => {
    set({ error });
  },

  setRooms: (rooms) => {
    set({ rooms });
  },

  updateRoomOrder: (roomId) => {
    set((state) => {
      const rooms = [...state.rooms];
      const roomIndex = rooms.findIndex((room) => room.id === roomId);
      if (roomIndex === -1) return state;

      const room = rooms[roomIndex];
      rooms.splice(roomIndex, 1);
      rooms.unshift(room);

      return { rooms };
    });
  },

  markRoomAsRead: (roomId) => {
    set((state) => {
      const rooms = state.rooms.map((room) =>
        room.id === roomId ? { ...room, unreadCount: 0 } : room
      );
      return { rooms };
    });
  },
}));
