"use client";

import { TabType } from "@/type/tab";
import { cn } from "@/util/style";

interface Props {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const RoomListTabs = ({ activeTab, onTabChange }: Props) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="container mx-auto flex h-16">
        <button
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-1 transition-colors",
            activeTab === "joined"
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          )}
          onClick={() => onTabChange("joined")}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span className="text-xs font-medium">내 채팅방</span>
          {activeTab === "joined" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
        <button
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-1 transition-colors",
            activeTab === "available"
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          )}
          onClick={() => onTabChange("available")}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span className="text-xs font-medium">채팅방 찾기</span>
          {activeTab === "available" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
      </div>
    </div>
  );
};
