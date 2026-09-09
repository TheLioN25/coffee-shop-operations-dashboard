import { supabase } from "../lib/supabase";

const BUCKET_PRODUCTOS = "productos";
const RUTA_PUBLICA_STORAGE = "/storage/v1/object/public/productos/";

function validarImagen(imagen) {
  if (!imagen) {
    return;
  }

  const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];

  if (!tiposPermitidos.includes(imagen.type)) {
    throw new Error("La imagen debe ser JPG, PNG o WebP.");
  }

  const tamanoMaximo = 5 * 1024 * 1024;

  if (imagen.size > tamanoMaximo) {
    throw new Error("La imagen no puede superar los 5 MB.");
  }
}

function generarNombreImagen(imagen) {
  const extension = imagen.name.split(".").pop()?.toLowerCase() || "jpg";

  return `${crypto.randomUUID()}.${extension}`;
}

async function subirImagen(imagen) {
  validarImagen(imagen);

  const nombreArchivo = generarNombreImagen(imagen);

  const { error } = await supabase.storage
    .from(BUCKET_PRODUCTOS)
    .upload(nombreArchivo, imagen, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from(BUCKET_PRODUCTOS)
    .getPublicUrl(nombreArchivo);

  return {
    nombreArchivo,
    publicUrl,
  };
}

function obtenerNombreArchivoDesdeUrl(imagenUrl) {
  if (!imagenUrl) {
    return null;
  }

  const indice = imagenUrl.indexOf(RUTA_PUBLICA_STORAGE);

  if (indice === -1) {
    return null;
  }

  return imagenUrl.substring(indice + RUTA_PUBLICA_STORAGE.length);
}

async function eliminarImagen(imagenUrl) {
  const nombreArchivo = obtenerNombreArchivoDesdeUrl(imagenUrl);

  if (!nombreArchivo) {
    return;
  }

  const { error } = await supabase.storage
    .from(BUCKET_PRODUCTOS)
    .remove([nombreArchivo]);

  if (error) {
    console.error("No fue posible eliminar la imagen anterior:", error);
  }
}

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

export async function obtenerTodosLosProductos() {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .order("activo", { ascending: false })
    .order("nombre", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function crearProducto({
  nombre,
  precio,
  stock,
  imagen,
}) {
  if (!nombre?.trim()) {
    throw new Error("El nombre del producto es obligatorio.");
  }

  if (Number(precio) <= 0) {
    throw new Error("El precio debe ser mayor que cero.");
  }

  if (Number(stock) < 0) {
    throw new Error("El stock no puede ser negativo.");
  }

  if (!imagen) {
    throw new Error("La imagen del producto es obligatoria.");
  }

  const imagenSubida = await subirImagen(imagen);

  try {
    const { data, error } = await supabase
      .from("productos")
      .insert({
        nombre: nombre.trim(),
        precio: Number(precio),
        stock: Number(stock),
        imagen_url: imagenSubida.publicUrl,
        activo: true,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    await eliminarImagen(imagenSubida.publicUrl);
    throw error;
  }
}

export async function actualizarProducto({
  id,
  nombre,
  precio,
  stock,
  imagen,
  imagenUrlActual,
}) {
  if (!nombre?.trim()) {
    throw new Error("El nombre del producto es obligatorio.");
  }

  if (Number(precio) <= 0) {
    throw new Error("El precio debe ser mayor que cero.");
  }

  if (Number(stock) < 0) {
    throw new Error("El stock no puede ser negativo.");
  }

  let nuevaImagenUrl = imagenUrlActual;
  let nuevaImagenSubida = null;

  if (imagen) {
    nuevaImagenSubida = await subirImagen(imagen);
    nuevaImagenUrl = nuevaImagenSubida.publicUrl;
  }

  try {
    const { data, error } = await supabase
      .from("productos")
      .update({
        nombre: nombre.trim(),
        precio: Number(precio),
        stock: Number(stock),
        imagen_url: nuevaImagenUrl,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (nuevaImagenSubida && imagenUrlActual) {
      await eliminarImagen(imagenUrlActual);
    }

    return data;
  } catch (error) {
    if (nuevaImagenSubida) {
      await eliminarImagen(nuevaImagenSubida.publicUrl);
    }

    throw error;
  }
}

export async function retirarProducto(id) {
  const { data, error } = await supabase
    .from("productos")
    .update({
      activo: false,
      fecha_actualizacion: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function reactivarProducto(id) {
  const { data, error } = await supabase
    .from("productos")
    .update({
      activo: true,
      fecha_actualizacion: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}