import "./globals.css";

export const metadata = {
  title: "팀톡",
  description: "실시간 팀 채팅 애플리케이션",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
