import { MonthlyDashboard } from "@/components/MonthlyDashboard";
import Link from "next/link";
import { UserBar } from "@/components/UserBar";

export default function HomePage() {
  return (
    <main className="container">
      <h1 className="h1">인생 재정관리 대시보드</h1>
      <UserBar />
      <p className="muted" style={{ marginBottom: 8 }}>
        인덱스에서 원하는 기능 페이지로 이동하세요.
      </p>

      <section style={{ marginBottom: 8 }}>
        <h3 style={{ marginBottom: 8 }}>페이지 인덱스</h3>
        <div className="index-grid">
          <Link href="/calculators" className="index-card">
            <div className="index-title">계산기 센터</div>
            <div className="index-desc">예금/적금, 대출, 배당, 은퇴 목표 계산을 한 번에.</div>
            <span className="index-badge">계산 도구</span>
          </Link>

          <Link href="/retirement" className="index-card">
            <div className="index-title">은퇴 추천 리포트</div>
            <div className="index-desc">현재 자산/수입/지출을 넣고 은퇴 가능성과 부족분 확인.</div>
            <span className="index-badge">리포트</span>
          </Link>

          <Link href="/money" className="index-card">
            <div className="index-title">돈 기록</div>
            <div className="index-desc">월별 수입·지출·투자·저축 입력과 차트 확인.</div>
            <span className="index-badge">입력/관리</span>
          </Link>

          <Link href="/insurance" className="index-card">
            <div className="index-title">보험 관리</div>
            <div className="index-desc">보험 등록/수정/삭제 및 월 보험료 확인.</div>
            <span className="index-badge">보험</span>
          </Link>
        </div>
      </section>

      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        <MonthlyDashboard />
      </div>
    </main>
  );
}
