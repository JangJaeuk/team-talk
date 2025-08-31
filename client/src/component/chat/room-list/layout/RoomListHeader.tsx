import { useLogoutMutation } from "@/hook/auth/mutation/useLogoutMutation";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";
import { useRouter } from "next/navigation";

export const RoomListHeader = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { logout, isPending } = useLogoutMutation(() => {
    router.push("/login");
  });

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex justify-between items-center p-3 sm:p-4 bg-white shadow-md relative z-10">
      <h1 className="text-lg sm:text-2xl font-bold">팀톡</h1>
      {user && (
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 sm:w-6 h-5 sm:h-6">
              <Image
                src={`/avatars/${user.avatar}.svg`}
                alt={"프로필 이미지"}
                width={24}
                height={24}
                className="rounded-full"
              />
            </div>
            <span className="text-sm sm:text-base">
              {user.nickname}님 환영합니다!
            </span>
          </div>
          <button
            onClick={handleLogout}
            disabled={isPending}
            className={`bg-red-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded flex items-center justify-center gap-1 w-[60px] sm:w-[70px] whitespace-nowrap text-xs transition-colors ${
              isPending ? "opacity-75 cursor-not-allowed" : "hover:bg-red-600"
            }`}
          >
            <span>로그아웃</span>
          </button>
        </div>
      )}
    </div>
  );
};
