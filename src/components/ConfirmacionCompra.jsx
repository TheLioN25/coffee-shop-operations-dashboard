import "./ConfirmacionCompra.css";

export default function ConfirmacionCompra({
  producto,
  resultado,
  cantidad,
  onClose,
}) {
  const total = Number(resultado?.total ?? producto.precio * cantidad);

  const subtotal = Math.round((total / 1.19) * 100) / 100;

  const iva = Math.round((total - subtotal) * 100) / 100;

  return (
    <div className="confirmacion-overlay" onClick={onClose}>
      <div
        className="confirmacion-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="confirmacion-icono">✓</div>

        <h2>¡Compra exitosa!</h2>

        <p className="confirmacion-texto">
          Tu compra fue registrada correctamente.
        </p>

        <div className="confirmacion-producto">
          <img src={producto.imagen_url} alt={producto.nombre} />

          <div>
            <h3>{producto.nombre}</h3>
            <p>Cantidad: {cantidad}</p>
          </div>
        </div>

        <div className="confirmacion-resumen">
          <div>
            <span>Base:</span>
            <span>${subtotal.toLocaleString("es-CO")}</span>
          </div>

          <div>
            <span>IVA (19%):</span>
            <span>${iva.toLocaleString("es-CO")}</span>
          </div>

          <div className="confirmacion-total">
            <span>Total:</span>
            <strong>${total.toLocaleString("es-CO")}</strong>
          </div>
        </div>

        {resultado?.venta_id && (
          <p className="numero-venta">Venta #{resultado.venta_id}</p>
        )}

        <button type="button" onClick={onClose}>
          Aceptar
        </button>
      </div>
    </div>
  );
}
