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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative bg-white p-6 rounded-lg w-96 max-w-[90%]">
        <h2 className="text-xl font-bold mb-4">방 코드</h2>
        <div className="bg-gray-100 p-4 rounded mb-4 text-center min-h-[48px]">
          {isLoading ? (
            <div className="animate-pulse h-6 bg-gray-200 rounded" />
          ) : (
            <p className="text-lg font-mono select-all">{data?.code}</p>
          )}
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
