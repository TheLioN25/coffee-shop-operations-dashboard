import { supabase } from "../lib/supabase";

export async function obtenerIngresosTotales() {
  const { data, error } = await supabase.rpc("obtener_ingresos_totales");

  if (error) {
    throw error;
  }

  return Number(data);
}

export async function obtenerTopClientes() {
  const { data, error } = await supabase.rpc("obtener_top_clientes");

  if (error) {
    throw error;
  }

  return data;
}

export async function obtenerStockBajo() {
  const { data, error } = await supabase.rpc("obtener_stock_bajo");

  if (error) {
    throw error;
  }

  return data;
}

export async function obtenerProductosMasVendidos() {
  const { data, error } = await supabase.rpc("obtener_productos_mas_vendidos");

  if (error) {
    throw error;
  }

  return data;
}
