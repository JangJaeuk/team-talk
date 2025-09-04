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
    <div className="fixed inset-0 z-[9999] backdrop-blur-sm bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">채팅방 참여</h2>
          <p className="text-gray-500 text-sm mt-2">
            방 코드를 입력하여 채팅방에 참여하세요
          </p>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            방 코드 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="예: PROJECT2024"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-800 transition-all duration-200 font-medium"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isPending}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              isFormValid && !isPending
                ? "bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isPending ? "참여 중..." : "참여하기"}
          </button>
        </div>
      </div>
    </div>
  );
};
