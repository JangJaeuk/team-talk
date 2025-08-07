"use client";

import api from "@/lib/axios";
import { getSocket } from "@/lib/socket"; // 소켓 유틸리티 사용
import { useAuthStore } from "@/store/useAuthStore"; // named import로 수정
import { ChatRoom, Message } from "@/types";
import { FC, useEffect, useState } from "react";

interface Props {
  onJoinRoom: (roomId: string) => void;
}

const ChatRoomList: FC<Props> = ({ onJoinRoom }) => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore(); // 현재 사용자 정보

  // 방 목록 조회
  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/rooms");
      setRooms(response.data);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();

    // Socket.IO 연결 설정
    try {
      const socket = getSocket();

      // 방 목록 업데이트 구독
      socket.on("room:list", (updatedRooms) => {
        console.log("Received updated room list:", updatedRooms);
        setRooms(updatedRooms);
      });

      // 새 메시지가 오면 방 목록 갱신
      socket.on("message:new", () => {
        fetchRooms();
      });

      // 방 가입/탈퇴 성공 이벤트 처리
      socket.on("room:join:success", (room) => {
        console.log("Successfully joined room:", room);
        onJoinRoom(room.id); // 가입 후 바로 입장
      });

      socket.on("room:leave:success", (roomId) => {
        console.log("Successfully left room:", roomId);
        fetchRooms(); // 방 목록 갱신
      });

      return () => {
        socket.off("room:list");
        socket.off("message:new");
        socket.off("room:join:success");
        socket.off("room:leave:success");
      };
    } catch (error) {
      console.error("Socket connection error:", error);
    }
  }, [onJoinRoom]);

  const formatTimestamp = (timestamp: Message["createdAt"]) => {
    if (!timestamp) return "";
    const date = new Date(
      timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000
    );
    return date.toLocaleString();
  };

  // 방 검색
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchRooms();
  };

  // 방 생성
  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;

    try {
      const response = await api.post("/rooms", {
        name: newRoomName.trim(),
        description: newRoomDescription.trim() || undefined,
      });

      setNewRoomName("");
      setNewRoomDescription("");
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  // 방 가입
  const handleJoinRoom = (roomId: string) => {
    const socket = getSocket();
    socket.emit("room:join", roomId);
  };

  // 방 탈퇴
  const handleLeaveRoom = (roomId: string) => {
    const socket = getSocket();
    socket.emit("room:leave", roomId);
  };

  // 방 입장
  const handleEnterRoom = (roomId: string) => {
    const socket = getSocket();
    socket.emit("room:enter", roomId);
    onJoinRoom(roomId);
  };

  // 가입한 방과 미가입 방 구분
  const joinedRooms = rooms.filter((room) =>
    room.participants.includes(user?.id || "")
  );
  const notJoinedRooms = rooms.filter(
    (room) => !room.participants.includes(user?.id || "")
  );

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="채팅방 검색..."
          className="flex-1 mr-2 p-2 border rounded"
        />
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          방 만들기
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">로딩 중...</div>
      ) : (
        <div className="space-y-4">
          {/* 가입한 방 목록 */}
          <div>
            <h2 className="text-lg font-bold mb-2">가입한 채팅방</h2>
            <div className="space-y-2">
              {joinedRooms
                .filter((room) =>
                  room.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((room) => (
                  <div
                    key={room.id}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{room.name}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEnterRoom(room.id)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          입장
                        </button>
                        <button
                          onClick={() => handleLeaveRoom(room.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          탈퇴
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{room.lastMessage?.content}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      참여자 {room.participants.length}명
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* 미가입 방 목록 */}
          <div>
            <h2 className="text-lg font-bold mb-2">참여 가능한 채팅방</h2>
            <div className="space-y-2">
              {notJoinedRooms
                .filter((room) =>
                  room.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((room) => (
                  <div
                    key={room.id}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{room.name}</h3>
                      <button
                        onClick={() => handleJoinRoom(room.id)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        가입
                      </button>
                    </div>
                    <p className="text-gray-600 text-sm">{room.description}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      참여자 {room.participants.length}명
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">새 채팅방 만들기</h2>
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="방 이름"
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              value={newRoomDescription}
              onChange={(e) => setNewRoomDescription(e.target.value)}
              placeholder="방 설명 (선택사항)"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                취소
              </button>
              <button
                onClick={handleCreateRoom}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                만들기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoomList;
