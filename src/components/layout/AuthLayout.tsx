import type { ReactNode } from "react";
import { CalendarDays, ShieldCheck, Sparkles } from "lucide-react";
import Brand from "./Brand";

export default function AuthLayout({
  children,
  mode,
}: {
  children: ReactNode;
  mode: "login" | "register";
}) {
  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-[1fr_1fr]">
      <section className="relative hidden overflow-hidden bg-[#101d31] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -right-24 top-24 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute -right-8 top-40 h-64 w-64 rounded-full border border-white/10" />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
        <Brand light />
        <div className="relative z-10 max-w-xl pb-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
            <Sparkles size={14} /> Mais clareza, menos preocupação
          </div>
          <h1 className="font-display text-5xl font-extrabold leading-[1.12] tracking-tight xl:text-6xl">
            {mode === "login"
              ? "Seu dinheiro organizado. Sua mente tranquila."
              : "Comece a cuidar melhor do seu dinheiro."}
          </h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-slate-300">
            Um jeito simples de acompanhar suas contas, planejar vencimentos e
            manter tudo em dia.
          </p>
          <div className="mt-10 grid max-w-md grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300">
                <CalendarDays size={18} />
              </div>
              <p className="font-bold">Vencimentos à vista</p>
              <p className="mt-1 text-sm text-slate-400">
                Saiba o que vem pela frente.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-sky-400/15 text-sky-300">
                <ShieldCheck size={18} />
              </div>
              <p className="font-bold">Mais controle</p>
              <p className="mt-1 text-sm text-slate-400">
                Organização sem complicação.
              </p>
            </div>
          </div>
        </div>
        <p className="relative z-10 text-xs text-slate-500">
          © 2026 Controle Financeiro · Projeto Acadêmico UFMS · M.SAN
        </p>
      </section>
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <Brand />
          </div>
          {children}
          <p className="mt-10 text-center text-xs leading-5 text-slate-400">
            Ao continuar, você concorda com nossos{" "}
            <a
              href="#"
              className="font-semibold text-slate-600 underline underline-offset-2"
            >
              Termos de uso
            </a>{" "}
            e{" "}
            <a
              href="#"
              className="font-semibold text-slate-600 underline underline-offset-2"
            >
              Política de privacidade
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
