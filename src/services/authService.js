import { supabase } from "../lib/supabase";

export async function verificarAdministrador() {
  const { data, error } = await supabase.rpc("es_usuario_admin");

  if (error) {
    throw error;
  }

  return data === true;
}
