import { supabase } from "../lib/supabase";

export async function obtenerProductos() {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("activo", true)
    .order("nombre", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}
