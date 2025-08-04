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

  // mounted가 false일 때는 children의 복사본을 반환하여 hydration 불일치 방지
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return <div>{children}</div>;
}
