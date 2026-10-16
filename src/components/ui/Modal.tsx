import type { ReactNode } from "react";
import { X } from "lucide-react";

type ModalProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
};

export default function Modal({
  title,
  eyebrow,
  description,
  onClose,
  children,
}: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-modal="true"
        role="dialog"
        aria-label={title}
        className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
          <div>
            {eyebrow && (
              <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                {eyebrow}
              </p>
            )}
            <h2 className="mt-1 font-display text-xl font-extrabold text-slate-900">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}