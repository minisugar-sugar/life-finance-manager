import { MonthlyDashboard } from "@/components/MonthlyDashboard";
import { InsurancePanel } from "@/components/InsurancePanel";
import { InsuranceForm } from "@/components/InsuranceForm";
import Link from "next/link";
import { UserBar } from "@/components/UserBar";
import { MoneyFlowSection } from "@/components/MoneyFlowSection";

export default function HomePage() {
  return (
    <main className="container">
      <h1 className="h1">인생 재정관리 대시보드</h1>
      <UserBar />
      <p className="muted" style={{ marginBottom: 16 }}>
        수입, 지출, 투자, 저축, 보험, 은퇴 계획을 통합해서 관리합니다.
      </p>

      <div style={{ marginBottom: 12, display: "flex", gap: 14 }}>
        <Link href="/calculators">→ 계산기 페이지</Link>
        <Link href="/retirement">→ 은퇴 추천 리포트</Link>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        <MonthlyDashboard />
      </div>

      <MoneyFlowSection />
      <InsuranceForm />
      <InsurancePanel />
    </main>
  );
}
