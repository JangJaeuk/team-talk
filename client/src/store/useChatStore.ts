import { getSocket } from "@/lib/socket";
import { ChatRoom, Message } from "@/types";
import { create } from "zustand";

interface ChatState {
  messages: Message[];
  currentRoom?: ChatRoom;
  typingUsers: { [userId: string]: boolean };
  isLoading: boolean;
  error: string | null;

  // 액션
  setCurrentRoom: (room: ChatRoom) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;
  setTypingStatus: (userId: string, isTyping: boolean) => void;
  clearMessages: () => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  currentRoom: undefined,
  typingUsers: {},
  isLoading: false,
  error: null,

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

    const socket = getSocket();
    socket.emit("message:update", messageId, content);

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

    const socket = getSocket();
    socket.emit("message:delete", messageId);

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
}));
