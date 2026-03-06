import Link from "next/link";
import { UserBar } from "@/components/UserBar";

export default function HomePage() {
  return (
    <main className="container">
      <div className="hero">
        <h1 className="hero-title">Life Finance Manager</h1>
        <div className="hero-sub">내 돈의 흐름을 한눈에 보고, 계산하고, 은퇴까지 준비하는 재정관리 웹</div>
      </div>

      <UserBar />

      <div className="soft-panel">
        <div className="section-title">페이지 인덱스</div>
        <div className="index-grid">
          <Link href="/calculators" className="index-card">
            <div className="index-title">계산기 센터</div>
            <div className="index-desc">예금/적금, 대출, 배당, 은퇴 목표 계산</div>
            <span className="index-badge">계산 도구</span>
          </Link>

          <Link href="/retirement" className="index-card">
            <div className="index-title">은퇴 추천 리포트</div>
            <div className="index-desc">현재 자산과 수입/지출 기반 은퇴 부족분 계산</div>
            <span className="index-badge">리포트</span>
          </Link>

          <Link href="/money" className="index-card">
            <div className="index-title">돈 기록</div>
            <div className="index-desc">월수입·월지출 등 큰 항목 + 세부 항목 기록/수정/삭제</div>
            <span className="index-badge">입력/관리</span>
          </Link>

          <Link href="/insurance" className="index-card">
            <div className="index-title">보험 관리</div>
            <div className="index-desc">보험 등록/수정/삭제 및 월 보험료 확인</div>
            <span className="index-badge">보험</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
