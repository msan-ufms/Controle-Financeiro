import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

type Option = { label: string; value: string };
type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: Option[];
};

export default function Select({
  label,
  options,
  className = "",
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? props.name;
  return (
    <label className="block">
      {label && (
        <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      )}
      <span className="relative block">
        <select
          id={selectId}
          className={`w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-9 text-sm outline-none focus:border-emerald-500 ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </span>
    </label>
  );
}