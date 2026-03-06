import { MoneyFlowSection } from "@/components/MoneyFlowSection";
import { FlowCharts } from "@/components/FlowCharts";
import Link from "next/link";

export default function MoneyPage() {
  return (
    <main className="container">
      <h1 className="h1">돈 기록</h1>
      <p className="muted" style={{ marginBottom: 12 }}>
        월별 수입/지출/투자/저축을 입력하고, 종류별 흐름을 그래프로 봅니다.
      </p>
      <div style={{ marginBottom: 12 }}>
        <Link href="/">← 홈으로</Link>
      </div>
      <MoneyFlowSection />
      <FlowCharts />
    </main>
  );
}
