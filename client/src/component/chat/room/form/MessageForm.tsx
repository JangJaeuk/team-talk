import { useRef } from "react";

interface Props {
  newMessage: string;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MessageForm = ({ newMessage, onSubmit, onChange }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    inputRef.current?.focus();
    onSubmit(e);
    console.log("포커스!");
  };

  return (
    <form
      onSubmit={onSubmit}
      className="p-2 sm:p-4 bg-white shadow-md border-t border-gray-100"
    >
      <div className="flex gap-2">
        <input
          type="text"
          ref={inputRef}
          value={newMessage}
          onChange={onChange}
          placeholder="메시지를 입력하세요..."
          className="flex-1 p-2 sm:p-3 border border-gray-300 rounded text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={handleButtonClick}
          className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium text-xs sm:text-sm whitespace-nowrap"
        >
          전송
        </button>
      </div>
    </form>
  );
};
