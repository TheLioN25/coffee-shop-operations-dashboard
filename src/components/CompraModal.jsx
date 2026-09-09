import { useState } from "react";
import { registrarVenta } from "../services/ventasService";
import "./CompraModal.css";

export default function CompraModal({ producto, onClose, onCompraExitosa }) {
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const total = Number(producto.precio) * cantidad;
  const subtotal = Math.round((total / 1.19) * 100) / 100;
  const iva = Math.round((total - subtotal) * 100) / 100;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!nombreCompleto.trim() || !email.trim()) {
      setError("Completa todos los datos.");
      return;
    }

    if (cantidad < 1 || cantidad > producto.stock) {
      setError("La cantidad seleccionada no está disponible.");
      return;
    }

    try {
      setCargando(true);

      const resultado = await registrarVenta({
        productoId: producto.id,
        cantidad,
        nombreCompleto: nombreCompleto.trim(),
        email: email.trim(),
      });

      onCompraExitosa({
        resultado,
        cantidad,
      });
    } catch (err) {
      console.error("Error al registrar la venta:", err);

      setError(err.message || "No fue posible registrar la compra.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}>
          ×
        </button>

        <h2>Comprar producto</h2>

        <div className="modal-product">
          <img src={producto.imagen_url} alt={producto.nombre} />

          <div className="modal-product-info">
            <h3>{producto.nombre}</h3>

            <p>${Number(producto.precio).toLocaleString("es-CO")}</p>

            <span>Disponible: {producto.stock}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="compra-form">
          <label>
            Nombre completo
            <input
              type="text"
              value={nombreCompleto}
              onChange={(event) => setNombreCompleto(event.target.value)}
              placeholder="Ej. Juan Pérez"
              required
            />
          </label>

          <label>
            Correo electrónico
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="correo@ejemplo.com"
              required
            />
          </label>

          <label>
            Cantidad
            <input
              type="number"
              min="1"
              max={producto.stock}
              value={cantidad}
              onChange={(event) => setCantidad(Number(event.target.value))}
              required
            />
          </label>

          <div className="modal-resumen">
            <div>
              <span>Base:</span>
              <span>${subtotal.toLocaleString("es-CO")}</span>
            </div>

            <div>
              <span>IVA (19%):</span>
              <span>${iva.toLocaleString("es-CO")}</span>
            </div>

            <div className="modal-total">
              <span>Total:</span>
              <strong>${total.toLocaleString("es-CO")}</strong>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="boton-confirmar" disabled={cargando}>
            {cargando ? "Procesando..." : "Confirmar compra"}
          </button>
        </form>
      </div>
    </div>
  );
}
