import { CreateRoomRq } from "@/rqrs/room/createRoomRq";
import { useMemo, useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRoomRq) => void;
}

export const CreateRoomModal = ({ isOpen, onClose, onSubmit }: Props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const isFormValid = useMemo(
    () => name.trim() !== "" && description.trim() !== "",
    [name, description]
  );

  const handleSubmit = () => {
    if (!isFormValid) return;

    onSubmit({
      name: name.trim(),
      description: description.trim(),
    });

    setName("");
    setDescription("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] backdrop-blur-[2px] bg-black/30 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96 max-w-[90%]">
        <h2 className="text-xl font-bold mb-4">새 채팅방 만들기</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="방 이름 *"
          className="w-full p-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="방 설명 *"
          className="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`px-4 py-2 rounded transition-colors ${
              isFormValid
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            만들기
          </button>
        </div>
      </div>
    </div>
  );
};
