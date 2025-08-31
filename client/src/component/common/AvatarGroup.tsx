import { Avatar } from "@/type/avatar";
import Image from "next/image";

interface Props {
  users: { id: string; avatar: Avatar }[];
}

export const AvatarGroup = ({ users }: Props) => {
  return (
    <div className="relative w-9 h-9 shrink-0">
      {users.length === 1 ? (
        // 1명일 때
        <Image
          key={users[0].id}
          src={`/avatars/${users[0].avatar}.svg`}
          alt="프로필"
          width={36}
          height={36}
          className="w-9 h-9 rounded-full"
        />
      ) : users.length === 2 ? (
        // 2명일 때
        <div className="flex w-full h-full">
          {users.slice(0, 2).map((user) => (
            <Image
              key={user.id}
              src={`/avatars/${user.avatar}.svg`}
              alt="프로필"
              width={18}
              height={36}
              className="w-[18px] h-9"
            />
          ))}
        </div>
      ) : users.length === 3 ? (
        // 3명일 때
        <div className="flex flex-col w-full h-full">
          <div className="flex justify-center">
            <Image
              key={users[0].id}
              src={`/avatars/${users[0].avatar}.svg`}
              alt="프로필"
              width={18}
              height={18}
              className="w-[18px] h-[18px]"
            />
          </div>
          <div className="flex">
            {users.slice(1, 3).map((user) => (
              <Image
                key={user.id}
                src={`/avatars/${user.avatar}.svg`}
                alt="프로필"
                width={18}
                height={18}
                className="w-[18px] h-[18px]"
              />
            ))}
          </div>
        </div>
      ) : (
        // 4명 이상일 때
        <div className="flex flex-wrap w-full h-full">
          {users.slice(0, 4).map((user) => (
            <Image
              key={user.id}
              src={`/avatars/${user.avatar}.svg`}
              alt="프로필"
              width={18}
              height={18}
              className="w-[18px] h-[18px]"
            />
          ))}
        </div>
      )}
    </div>
  );
};
