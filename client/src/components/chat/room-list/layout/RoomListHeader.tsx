import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";
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
    <div className="flex justify-between items-center p-3 sm:p-4 bg-white shadow-md relative z-10">
      <h1 className="text-lg sm:text-2xl font-bold">팀톡</h1>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 sm:w-6 h-5 sm:h-6">
            <Image
              src={`/avatars/${user?.avatar ?? "avatar1"}.svg`}
              alt={user?.nickname || ""}
              width={24}
              height={24}
              className="rounded-full"
            />
          </div>
          <span className="text-sm sm:text-base">
            {user?.nickname}님 환영합니다!
          </span>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className={`bg-red-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded flex items-center justify-center gap-1 w-[60px] sm:w-[70px] whitespace-nowrap text-xs transition-colors ${
            isLoading ? "opacity-75 cursor-not-allowed" : "hover:bg-red-600"
          }`}
        >
          <span>로그아웃</span>
        </button>
      </div>
    </div>
  );
};
