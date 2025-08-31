import { useState } from "react";

interface Props {
  isOpen: boolean;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
}

export const JoinRoomModal = ({
  isOpen,
  isPending,
  onClose,
  onSubmit,
}: Props) => {
  const [code, setCode] = useState("");
  const isFormValid = code.trim() !== "";

  const handleSubmit = () => {
    if (!isFormValid) return;
    onSubmit(code.trim());
    setCode("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] backdrop-blur-[2px] bg-black/30 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96 max-w-[90%]">
        <h2 className="text-xl font-bold mb-4">채팅방 참여</h2>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="방 코드 *"
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
            disabled={!isFormValid || isPending}
            className={`px-4 py-2 rounded transition-colors ${
              isFormValid
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            참여하기
          </button>
        </div>
      </div>
    </div>
  );
};
