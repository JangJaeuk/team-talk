import { useEffect, useRef } from "react";

interface Props {
  messageId: string;
  showReadBy: boolean;
  showMenu: boolean;
  setShowReadBy: (show: boolean) => void;
  setActiveMenuMessageId: (messageId: string | null) => void;
}

export const useMessageSettingsMenu = ({
  messageId,
  showReadBy,
  showMenu,
  setShowReadBy,
  setActiveMenuMessageId,
}: Props) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuMessageId(showMenu ? null : messageId);
    if (showReadBy) setShowReadBy(false);
  };

  const handleReadByClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReadBy(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuMessageId(null);
        if (!showReadBy) setShowReadBy(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showMenu, showReadBy, messageId, setActiveMenuMessageId, setShowReadBy]);

  return {
    menuRef,
    handleSettingsClick,
    handleReadByClick,
  };
};
