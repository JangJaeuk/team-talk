"use client";

import { InitProvider } from "@/provider/initProvider";
import { QueryProvider } from "@/provider/queryProvider";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <InitProvider>{children}</InitProvider>
    </QueryProvider>
  );
}
