import { supabase } from "../lib/supabase";

export async function registrarVenta({
  productoId,
  cantidad,
  nombreCompleto,
  email,
}) {
  const { data, error } = await supabase.rpc("registrar_venta", {
    p_producto_id: productoId,
    p_cantidad: cantidad,
    p_nombre_completo: nombreCompleto,
    p_email: email,
  });

  if (error) {
    throw error;
  }

  return data;
}
