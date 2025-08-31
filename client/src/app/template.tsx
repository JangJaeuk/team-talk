"use client";

import { InitProvider } from "@/providers/initProvider";
import { QueryProvider } from "@/providers/queryProvider";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <InitProvider>{children}</InitProvider>
    </QueryProvider>
  );
}
