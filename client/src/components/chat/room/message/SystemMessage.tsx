import type { Message } from "@/types";

interface Props {
  message: Message;
}

export const SystemMessage = ({ message }: Props) => {
  return (
    <div className="mb-2 text-center">
      <div className="inline-block px-4 py-1 rounded-full bg-gray-100 text-gray-600 text-sm">
        {message.content}
      </div>
    </div>
  );
};
