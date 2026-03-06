export const LABELS: Record<string, string> = {
  // money type
  income: "수입",
  expense: "지출",
  invest: "투자",
  save: "저축",

  // income
  SALARY: "월급",
  SIDE: "부수입",
  OTHER: "기타",

  // expense
  HOUSING: "주거",
  FOOD: "식비",
  TRANSPORT: "교통",
  LEISURE: "여가",
  COMMUNICATION: "통신",
  UTILITIES: "공과금",
  MEDICAL: "의료",

  // invest
  STOCK: "주식",
  ETF: "ETF",
  BOND: "채권",
  FUND: "펀드",
  CRYPTO: "코인",

  // saving
  INSTALLMENT_SAVING: "적금",
  DEPOSIT: "예금",
  CMA: "CMA",
  CASH: "현금",

  // status
  ACTIVE: "유지중",
  MATURED: "만기",
  CANCELED: "해지",
  PAID_UP: "완납"
};

export function toKo(key: string) {
  return LABELS[key] ?? key;
}
