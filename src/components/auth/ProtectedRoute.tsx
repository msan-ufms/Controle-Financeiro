import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      //onAuthStateChange() acompanha alterações na autenticação, inclusive o logout.
      if (active) {
        setSession(session);
        setLoading(false);
      }
    });

    supabase.auth
      .getSession() //getSession() verifica se existe uma sessão salva.
      .then(({ data, error }) => {
        if (!active) return;

        setSession(error ? null : data.session);
        setLoading(false);
      })
      .catch(() => {
        if (active) {
          setSession(null);
          setLoading(false);
        }
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <p>Verificando sessão...</p>; // Enquanto a verificação acontece, a página privada não é exibida.
  }

  if (!session) {
    return <Navigate to="/login" replace />; // Sem sessão, o usuário é redirecionado para /login.
  }

  return children;
}
