"use client";

type Props = {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
};

function formatNumber(n: number) {
  if (!Number.isFinite(n)) return "";
  return new Intl.NumberFormat("ko-KR").format(n);
}

export function FormattedNumberInput({ value, onChange, placeholder }: Props) {
  return (
    <input
      inputMode="numeric"
      placeholder={placeholder}
      value={value === 0 ? "" : formatNumber(value)}
      onChange={(e) => {
        const only = e.target.value.replace(/[^0-9]/g, "");
        onChange(only ? Number(only) : 0);
      }}
    />
  );
}
