"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { initialize } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      try {
        await initialize();
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };

    init();
    setMounted(true);
  }, [initialize]);

  // 초기화가 완료되기 전까지는 아무것도 렌더링하지 않음
  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}
