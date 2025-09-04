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
  const [code, setCode] = useState("");
  const isFormValid = useMemo(
    () => name.trim() !== "" && description.trim() !== "" && code.trim() !== "",
    [name, description, code]
  );

  const handleSubmit = () => {
    if (!isFormValid) return;

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      code: code.trim(),
    });

    setName("");
    setDescription("");
    setCode("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] backdrop-blur-sm bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">
            새 채팅방 만들기
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            정보를 입력하여 새로운 채팅방을 생성하세요
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              방 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 프로젝트 회의실"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              방 설명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="예: 팀 프로젝트 논의를 위한 공간"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
            />
          </div>

          <div>
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
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-800 transition-all duration-200 font-medium"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              isFormValid
                ? "bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            만들기
          </button>
        </div>
      </div>
    </div>
  );
};
