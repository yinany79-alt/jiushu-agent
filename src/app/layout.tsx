import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "九数算法中台 - Agentic Beta",
  description: "九数算法中台 Agentic 转型版本",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
