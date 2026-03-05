import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "인생 재정관리",
  description: "투자/저축/보험/은퇴를 한 번에 관리하는 개인 재정 서비스"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
