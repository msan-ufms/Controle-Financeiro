import { useState, type FormEvent } from "react";
import { ArrowUpRight, CircleUserRound, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
import AuthField from "./AuthField";
import Button from "../ui/Button";

export default function LoginForm() {
  const [message, setMessage] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Demonstração: autenticação ainda não conectada ao backend.");
  }

  return (
    <>
      <div className="mb-8">
        <p className="mb-2 text-sm font-bold text-emerald-600">
          BEM-VINDO DE VOLTA
        </p>
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
          Entre na sua conta
        </h2>
      </div>
      <form onSubmit={submit} className="space-y-5">
        <AuthField
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          required
          icon={<CircleUserRound size={18} />}
        />
        <AuthField
          label="Senha"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Digite sua senha"
          required
          icon={<LockKeyhole size={18} />}
        />
        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="flex items-center gap-2 text-slate-500">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 accent-emerald-600"
            />{" "}
            Manter conectado
          </label>
          <button
            type="button"
            onClick={() =>
              setMessage(
                "A recuperação de senha será implementada com o backend.",
              )
            }
            className="font-bold text-emerald-700 hover:text-emerald-800"
          >
            Esqueci a senha
          </button>
        </div>
        <Button type="submit" className="w-full">
          Entrar <ArrowUpRight size={17} />
        </Button>
        {message && (
          <p
            role="status"
            className="rounded-xl bg-amber-50 p-3 text-sm leading-5 text-amber-800"
          >
            {message}
          </p>
        )}
      </form>
      <p className="mt-7 text-center text-sm text-slate-500">
        Ainda não tem uma conta?{" "}
        <Link
          to="/cadastro"
          className="font-extrabold text-emerald-700 hover:underline"
        >
          Criar cadastro
        </Link>
      </p>
    </>
  );
}
