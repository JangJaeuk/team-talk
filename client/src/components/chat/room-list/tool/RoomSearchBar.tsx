interface Props {
  searchQuery: string;
  showButton?: boolean;
  searchPlaceholder?: string;
  buttonText?: string;
  onSearch: (query: string) => void;
  onClickButton?: () => void;
}

export const RoomSearchBar = ({
  searchQuery,
  showButton = true,
  searchPlaceholder = "검색...",
  buttonText = "버튼",
  onSearch,
  onClickButton,
}: Props) => {
  return (
    <div className="flex justify-between gap-4 items-center p-4 bg-white shadow-md relative z-10">
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        />
      </div>
      {showButton && (
        <button
          onClick={onClickButton}
          className="inline-flex items-center px-4 py-2.5 bg-blue-500 text-sm font-medium text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-1.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          {buttonText}
        </button>
      )}
    </div>
  );
};
