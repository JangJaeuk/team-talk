"use client";

import { Chat } from "@/components/Chat";
import { Providers } from "./providers";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Providers>
        <Chat />
      </Providers>
    </main>
  );
}
