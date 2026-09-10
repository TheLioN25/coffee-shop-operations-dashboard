import { supabase } from "../lib/supabase";

export async function obtenerClientes() {
  const { data, error } = await supabase.rpc("obtener_clientes");

  if (error) {
    throw error;
  }

  return data;
}

export async function obtenerHistorialCliente(clienteId) {
  const { data, error } = await supabase.rpc("obtener_historial_cliente", {
    p_cliente_id: clienteId,
  });

  if (error) {
    throw error;
  }

  return data;
}
