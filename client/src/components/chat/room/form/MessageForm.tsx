interface Props {
  newMessage: string;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MessageForm = ({ newMessage, onSubmit, onChange }: Props) => {
  return (
    <form onSubmit={onSubmit} className="p-4 border-t">
      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={onChange}
          placeholder="메시지를 입력하세요..."
          className="flex-1 p-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          전송
        </button>
      </div>
    </form>
  );
};
