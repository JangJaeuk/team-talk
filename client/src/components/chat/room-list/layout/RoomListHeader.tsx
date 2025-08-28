import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const RoomListHeader = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout(() => router.push("/login"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">채팅방 목록</h1>
      <div className="flex items-center">
        <span className="mr-4">{user?.nickname}님 환영합니다!</span>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className={`bg-red-500 text-white px-3 py-1.5 rounded flex items-center justify-center space-x-2 w-[90px] whitespace-nowrap text-sm ${
            isLoading ? "opacity-75 cursor-not-allowed" : "hover:bg-red-600"
          }`}
        >
          {isLoading && <LoadingSpinner />}
          <span>로그아웃</span>
        </button>
      </div>
    </div>
  );
};
