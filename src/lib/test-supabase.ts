import { supabase } from "./supabase";

export async function testSupabaseConnection() {
  const { error } = await supabase.auth.getSession();

  if (error) {
    console.error("Erro ao acessar o Supabase:", error.message);
    return false;
  }

  console.log("Cliente Supabase inicializado com sucesso.");
  return true;
}
