"use client";

import api from "@/lib/axios"; // 커스텀 axios 인스턴스 사용
import { ChatRoom } from "@/types";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

interface RoomListProps {
  onJoinRoom: (roomId: string) => void;
}

export function RoomList({ onJoinRoom }: RoomListProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 방 목록 조회
  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/rooms"); // 커스텀 axios 인스턴스 사용
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
      const socket = io(
        process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000",
        {
          auth: {
            token: localStorage.getItem("token"),
          },
        }
      );

      // 방 목록 업데이트 구독
      socket.on("room:list", (updatedRooms) => {
        console.log("Received updated room list:", updatedRooms);
        setRooms(updatedRooms);
      });

      return () => {
        socket.off("room:list");
        socket.disconnect();
      };
    } catch (error) {
      console.error("Socket connection error:", error);
    }
  }, []);

  // 방 검색
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // 실제로는 서버에 검색 요청을 보내야 하지만, 지금은 클라이언트에서 필터링
    fetchRooms();
  };

  // 방 생성
  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;

    try {
      const response = await api.post("/rooms", {
        // 커스텀 axios 인스턴스 사용
        name: newRoomName.trim(),
        description: newRoomDescription.trim() || undefined,
      });

      setNewRoomName("");
      setNewRoomDescription("");
      setShowCreateModal(false);
      // 방 생성 후 목록 갱신은 socket 이벤트를 통해 자동으로 이루어짐
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

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

      <div className="space-y-2">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="border rounded p-4 hover:bg-gray-50 cursor-pointer"
            onClick={() => onJoinRoom(room.id)}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold">{room.name}</h3>
              <span className="text-sm text-gray-500">
                {room.participantCount}명 참여 중
              </span>
            </div>
            {room.description && (
              <p className="text-sm text-gray-600 mt-1">{room.description}</p>
            )}
          </div>
        ))}
      </div>

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
}
