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
    <div className="flex justify-between p-4 bg-white shadow-md relative z-10">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="채팅방 검색..."
        className="flex-1 mr-2 p-2 bg-gray-50 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
