import { useEffect, useState } from "react";
import {
  actualizarProducto,
  crearProducto,
} from "../services/productosService";
import "./ProductoForm.css";

function ProductoForm({ producto = null, onGuardado, onCancelar }) {
  const modoEdicion = Boolean(producto);

  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (producto) {
      setNombre(producto.nombre);
      setPrecio(producto.precio);
      setStock(producto.stock);
      setImagenPreview(producto.imagen_url);
      setImagen(null);
    } else {
      setNombre("");
      setPrecio("");
      setStock("");
      setImagen(null);
      setImagenPreview("");
    }

    setError("");
  }, [producto]);

  function manejarCambioImagen(event) {
    const archivo = event.target.files?.[0];

    if (!archivo) {
      return;
    }

    setImagen(archivo);
    setError("");

    const previewUrl = URL.createObjectURL(archivo);
    setImagenPreview(previewUrl);
  }

  function validarFormulario() {
    const precioNumerico = Number(precio);
    const stockNumerico = Number(stock);

    if (!nombre.trim()) {
      return "El nombre del producto es obligatorio.";
    }

    if (nombre.trim().length > 70) {
      return "El nombre no puede superar los 70 caracteres.";
    }

    if (!Number.isFinite(precioNumerico) || precioNumerico <= 0) {
      return "El precio debe ser mayor que cero.";
    }

    if (!Number.isFinite(stockNumerico) || stockNumerico < 0) {
      return "El stock no puede ser negativo.";
    }

    if (!Number.isInteger(stockNumerico)) {
      return "El stock debe ser un número entero.";
    }

    if (!modoEdicion && !imagen) {
      return "La imagen del producto es obligatoria.";
    }

    return "";
  }

  async function manejarSubmit(event) {
    event.preventDefault();

    const mensajeError = validarFormulario();

    if (mensajeError) {
      setError(mensajeError);
      return;
    }

    try {
      setCargando(true);
      setError("");

      let resultado;
      let tipoOperacion;

      if (modoEdicion) {
        resultado = await actualizarProducto({
          id: producto.id,
          nombre,
          precio,
          stock,
          imagen,
          imagenUrlActual: producto.imagen_url,
        });

        tipoOperacion = "actualizado";
      } else {
        resultado = await crearProducto({
          nombre,
          precio,
          stock,
          imagen,
        });

        tipoOperacion = "creado";
      }

      onGuardado(resultado, tipoOperacion);
    } catch (error) {
      console.error("Error al guardar producto:", error);

      setError(error?.message || "No fue posible guardar el producto.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="producto-form-overlay">
      <section
        className="producto-form"
        role="dialog"
        aria-modal="true"
        aria-labelledby="producto-form-titulo"
      >
        <div className="producto-form-header">
          <div>
            <h2 id="producto-form-titulo">
              {modoEdicion ? "Editar producto" : "Nuevo producto"}
            </h2>

            <p>
              {modoEdicion
                ? "Actualiza la información del producto."
                : "Registra un nuevo producto en el inventario."}
            </p>
          </div>

          <button
            className="producto-form-cerrar"
            type="button"
            onClick={onCancelar}
            disabled={cargando}
            aria-label="Cerrar formulario"
          >
            ×
          </button>
        </div>

        <form onSubmit={manejarSubmit}>
          <div className="producto-form-campo">
            <label htmlFor="producto-nombre">Nombre</label>

            <input
              id="producto-nombre"
              type="text"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              maxLength={70}
              placeholder="Ej. Café Americano"
              disabled={cargando}
              required
            />
          </div>

          <div className="producto-form-fila">
            <div className="producto-form-campo">
              <label htmlFor="producto-precio">Precio final</label>

              <input
                id="producto-precio"
                type="number"
                value={precio}
                onChange={(event) => setPrecio(event.target.value)}
                min="0.01"
                step="0.01"
                placeholder="6500"
                disabled={cargando}
                required
              />

              <small>Precio de venta incluido IVA.</small>
            </div>

            <div className="producto-form-campo">
              <label htmlFor="producto-stock">Stock</label>

              <input
                id="producto-stock"
                type="number"
                value={stock}
                onChange={(event) => setStock(event.target.value)}
                min="0"
                step="1"
                placeholder="10"
                disabled={cargando}
                required
              />

              <small>Unidades disponibles.</small>
            </div>
          </div>

          <div className="producto-form-campo">
            <label htmlFor="producto-imagen">Imagen</label>

            <input
              id="producto-imagen"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={manejarCambioImagen}
              disabled={cargando}
            />

            <small>
              JPG, PNG o WebP. Tamaño máximo: 5 MB.
              {modoEdicion && " Déjalo vacío para conservar la imagen actual."}
            </small>
          </div>

          {imagenPreview && (
            <div className="producto-form-preview">
              <span>Vista previa</span>

              <img src={imagenPreview} alt="Vista previa del producto" />
            </div>
          )}

          {error && (
            <p className="producto-form-error" role="alert">
              {error}
            </p>
          )}

          <div className="producto-form-acciones">
            <button
              className="producto-form-cancelar"
              type="button"
              onClick={onCancelar}
              disabled={cargando}
            >
              Cancelar
            </button>

            <button
              className="producto-form-guardar"
              type="submit"
              disabled={cargando}
            >
              {cargando
                ? "Guardando..."
                : modoEdicion
                  ? "Guardar cambios"
                  : "Crear producto"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default ProductoForm;
