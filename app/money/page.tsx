import { MoneyFlowSection } from "@/components/MoneyFlowSection";
import { FlowCharts } from "@/components/FlowCharts";
import { MonthlyDashboard } from "@/components/MonthlyDashboard";

export default function MoneyPage() {
  return (
    <main className="container">
      <h1 className="h1">돈 기록</h1>
      <p className="muted" style={{ marginBottom: 12 }}>
        월별 수입/지출/투자/저축을 입력하고, 종류별 흐름을 그래프로 봅니다.
      </p>
      <div className="section-title">이달의 요약</div>
      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        <MonthlyDashboard />
      </div>

      <MoneyFlowSection />
      <FlowCharts />
    </main>
  );
}
