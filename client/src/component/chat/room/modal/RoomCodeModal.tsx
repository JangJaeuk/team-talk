import { roomQueries } from "@/query/room";
import { useQuery } from "@tanstack/react-query";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
}

export const RoomCodeModal = ({ isOpen, onClose, roomId }: Props) => {
  const { data, isLoading } = useQuery({
    ...roomQueries.code(roomId),
    enabled: isOpen, // 모달이 열릴 때만 데이터 조회
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] backdrop-blur-sm bg-black/50 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">방 코드</h2>
          <p className="text-gray-500 text-sm mt-2">
            다른 사용자들과 공유하여 채팅방에 초대하세요
          </p>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            채팅방 코드
          </label>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100 p-6 rounded-xl text-center min-h-[80px] flex items-center justify-center">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 w-32 bg-gray-200 rounded-lg" />
              </div>
            ) : (
              <div>
                <p className="text-2xl font-mono font-bold text-blue-600 select-all tracking-wider">
                  {data?.code}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-3 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-800 transition-all duration-200 font-medium min-w-[120px]"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
