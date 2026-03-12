import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "인생 재정관리",
  description: "투자/저축/보험/은퇴를 한 번에 관리하는 개인 재정 서비스"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header className="site-header">
          <div className="site-header-inner">
            <div className="site-brand">💸 Life Finance Manager</div>
            <nav className="site-nav">
              <Link href="/">홈</Link>
              <Link href="/calculators">계산기 센터</Link>
              <Link href="/money">돈 기록</Link>
              <Link href="/insurance">보험 관리</Link>
              <Link href="/retirement">은퇴 리포트</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
