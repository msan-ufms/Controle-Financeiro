import { useState, type FormEvent } from "react";
import { ArrowUpRight, CircleUserRound, LockKeyhole } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthField from "./AuthField";
import Button from "../ui/Button";
import { supabase } from "../../lib/supabase";

export default function LoginForm() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); //controla o envio do formulário e evita novas tentativas enquanto uma autenticação está em andamento.
  const navigate = useNavigate();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); //impede o recarregamento da página ao enviar o formulário.

    if (isSubmitting) return;

    setMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget); //obtém os valores dos campos email e password.
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    //signInWithPassword: envia as credenciais ao Supabase Auth.
    //error:identifica falhas na autenticação e exibe uma mensagem ao usuário.
    try {
      const { error } = await supabase.auth.signInWithPassword({
        //envia as credenciais ao Supabase Auth.
        email,
        password,
      });

      if (error) {
        console.error("Erro no login:", error.message);

        if (error.message === "Invalid login credentials") {
          setMessage(
            "E-mail ou senha inválidos. Confira os dados e tente novamente.",
          );
        } else {
          setMessage("Não foi possível realizar o login. Tente novamente.");
        }

        return;
      }

      navigate("/"); //vai para a página inicial após o login bem-sucedido.
    } catch (error) {
      console.error("Erro ao conectar ao Supabase:", error);
      setMessage(
        "Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
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
          {isSubmitting ? "Entrando..." : "Entrar"}
          {!isSubmitting && <ArrowUpRight size={17} />}
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
