import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function Input({ label, className = "", id, ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <label className="block">
      {label && (
        <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      )}
      <input
        id={inputId}
        className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 ${className}`}
        {...props}
      />
    </label>
  );
}