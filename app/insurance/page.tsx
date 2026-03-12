import { InsuranceForm } from "@/components/InsuranceForm";
import { InsurancePanel } from "@/components/InsurancePanel";

export default function InsurancePage() {
  return (
    <main className="container">
      <h1 className="h1">보험 관리</h1>
      <p className="muted" style={{ marginBottom: 12 }}>
        보험을 등록/수정/삭제하고 월 보험료를 확인합니다.
      </p>
      <InsuranceForm />
      <InsurancePanel />
    </main>
  );
}
