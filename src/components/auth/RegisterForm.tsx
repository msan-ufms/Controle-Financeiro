import { useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  CircleUserRound,
  LockKeyhole,
  AtSign,
} from "lucide-react";
import { Link } from "react-router-dom";
import AuthField from "./AuthField";
import Button from "../ui/Button";

export default function RegisterForm() {
  const [message, setMessage] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    {
      /* impedir o envio tradicional do navegador para tratar com o javascript */
    }
    const formData = new FormData(event.currentTarget);
    {
      /* lê os valores preenchidos*/
    }
    if (formData.get("password") !== formData.get("confirmPassword")) {
      {
        /* apenas senha por enquanto */
      }
      setMessage("As senhas informadas não coincidem.");
      return;
    }
    setMessage(
      "Cadastro demonstrativo validado no navegador. A gravação no banco será feita quando conectarmos a API.",
    );
  }

  return (
    <>
      <div className="mb-7">
        <p className="mb-2 text-sm font-bold text-emerald-600">
          CRIE SUA CONTA
        </p>
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
          Vamos começar?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Preencha os dados abaixo para criar seu acesso.
        </p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <AuthField
          label="Nome/Apelido"
          name="name"
          autoComplete="name"
          placeholder="Como podemos chamar você?"
          required
          icon={<CircleUserRound size={18} />}
        />
        <AuthField
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          required
          icon={<AtSign size={18} />}
        />
        <AuthField
          label="Senha"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          placeholder="Crie uma senha com 8+ caracteres"
          required
          icon={<LockKeyhole size={18} />}
        />
        <AuthField
          label="Confirmar senha"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          placeholder="Digite a senha novamente"
          required
          icon={<LockKeyhole size={18} />}
        />
        <label className="flex items-start gap-2.5 text-xs leading-5 text-slate-500">
          <input
            type="checkbox"
            required
            className="mt-1 h-4 w-4 rounded accent-emerald-600"
          />
          Li e concordo com os termos de uso e a política de privacidade.
        </label>
        <Button type="submit" className="w-full">
          Criar minha conta <ArrowUpRight size={17} />
        </Button>
        {message && (
          <p
            role="status"
            className="rounded-xl bg-emerald-50 p-3 text-sm leading-5 text-emerald-800"
          >
            {message}
          </p>
        )}
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Já tem uma conta?{" "}
        <Link
          to="/login"
          className="font-extrabold text-emerald-700 hover:underline"
        >
          Fazer login
        </Link>
      </p>
    </>
  );
}
