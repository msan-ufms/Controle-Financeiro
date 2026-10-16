import type { ReactNode } from "react";

type SummaryCardProps = {
  label: string;
  amount: string;
  note: string;
  icon: ReactNode;
  tone: "dark" | "green" | "rose" | "blue";
};

const tones = {
  dark: "bg-[#101d31] text-white",
  green: "bg-white text-slate-900 border border-slate-100",
  rose: "bg-white text-slate-900 border border-slate-100",
  blue: "bg-white text-slate-900 border border-slate-100",
};

const iconTones = {
  dark: "bg-white/10 text-emerald-300",
  green: "bg-emerald-50 text-emerald-700",
  rose: "bg-rose-50 text-rose-600",
  blue: "bg-sky-50 text-sky-700",
};

export default function SummaryCard({
  label,
  amount,
  note,
  icon,
  tone,
}: SummaryCardProps) {
  return (
    <div className={`rounded-2xl p-5 shadow-soft ${tones[tone]}`}>
      <div className="flex items-center justify-between">
        <span
          className={`grid h-10 w-10 place-items-center rounded-xl ${iconTones[tone]}`}
        >
          {icon}
        </span>
        {tone === "dark" && (
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-emerald-200">
            RESUMO
          </span>
        )}
      </div>
      <p
        className={`mt-5 text-sm font-semibold ${tone === "dark" ? "text-slate-300" : "text-slate-500"}`}
      >
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-extrabold tracking-tight">
        {amount}
      </p>
      <p
        className={`mt-2 text-xs ${tone === "dark" ? "text-slate-400" : "text-slate-400"}`}
      >
        {note}
      </p>
    </div>
  );
}
