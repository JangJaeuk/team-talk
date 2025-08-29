interface Props {
  searchQuery: string;
  onSearch: (query: string) => void;
  onCreateRoom: () => void;
}

export const RoomSearchBar = ({
  searchQuery,
  onSearch,
  onCreateRoom,
}: Props) => {
  return (
    <div className="flex justify-between mb-4 px-4">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="채팅방 검색..."
        className="flex-1 mr-2 p-2 border rounded"
      />
      <button
        onClick={onCreateRoom}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        방 만들기
      </button>
    </div>
  );
};
