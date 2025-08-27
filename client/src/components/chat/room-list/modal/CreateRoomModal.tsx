import { RoomFormData } from "@/types/room";
import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoomFormData) => void;
}

export const CreateRoomModal = ({ isOpen, onClose, onSubmit }: Props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
    });
    setName("");
    setDescription("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-[2px] bg-black/30 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">새 채팅방 만들기</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="방 이름"
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="방 설명 (선택사항)"
          className="w-full p-2 border rounded mb-4"
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            만들기
          </button>
        </div>
      </div>
    </div>
  );
};
