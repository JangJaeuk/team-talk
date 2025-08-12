import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export const RoomListHeader = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">채팅방 목록</h1>
      <div className="flex items-center">
        <span className="mr-4">{user?.nickname}님 환영합니다!</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
};
