import { MonthlyDashboard } from "@/components/MonthlyDashboard";
import { InsurancePanel } from "@/components/InsurancePanel";

export default function HomePage() {
  return (
    <main className="container">
      <h1 className="h1">인생 재정관리 대시보드</h1>
      <p className="muted" style={{ marginBottom: 16 }}>
        수입, 지출, 투자, 저축, 보험, 은퇴 계획을 통합해서 관리합니다.
      </p>

      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        <MonthlyDashboard />
      </div>

      <InsurancePanel />
    </main>
  );
}
