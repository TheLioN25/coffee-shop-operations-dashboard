import { useEffect, useState } from "react";
import {
  obtenerClientes,
  obtenerHistorialCliente,
} from "../services/clientesService";
import "./Clientes.css";

function agruparVentas(historial) {
  const ventasMap = new Map();

  historial.forEach((detalle) => {
    if (!ventasMap.has(detalle.venta_id)) {
      ventasMap.set(detalle.venta_id, {
        ventaId: detalle.venta_id,
        fechaCompra: detalle.fecha_compra,
        totalVenta: Number(detalle.total_venta),
        productos: [],
      });
    }

    ventasMap.get(detalle.venta_id).productos.push({
      productoId: detalle.producto_id,
      nombre: detalle.producto_nombre,
      cantidad: detalle.cantidad,
      precioUnitario: Number(detalle.precio_unitario),
      subtotal: Number(detalle.subtotal),
    });
  });

  return Array.from(ventasMap.values());
}

function formatearPrecio(valor) {
  return Number(valor).toLocaleString("es-CO");
}

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [error, setError] = useState("");

  async function cargarClientes() {
    try {
      setCargando(true);
      setError("");

      const data = await obtenerClientes();

      setClientes(data);

      if (data.length > 0) {
        await seleccionarCliente(data[0]);
      }
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      setError("No fue posible cargar los clientes.");
    } finally {
      setCargando(false);
    }
  }

  async function seleccionarCliente(cliente) {
    try {
      setClienteSeleccionado(cliente);
      setCargandoHistorial(true);
      setError("");

      const data = await obtenerHistorialCliente(cliente.id);

      // La API devuelve detalles individuales.
      // Aquí los agrupamos por venta para mostrar una compra
      // como una única unidad visual.
      setHistorial(agruparVentas(data));
    } catch (error) {
      console.error("Error al cargar historial:", error);
      setHistorial([]);
      setError("No fue posible cargar el historial del cliente.");
    } finally {
      setCargandoHistorial(false);
    }
  }

  useEffect(() => {
    cargarClientes();
  }, []);

  if (cargando) {
    return (
      <section className="clientes">
        <div className="clientes-header">
          <div>
            <h2>Clientes</h2>
            <p>Consulta de clientes e historial de compras</p>
          </div>
        </div>

        <p className="clientes-estado">Cargando clientes...</p>
      </section>
    );
  }

  return (
    <section className="clientes">
      <div className="clientes-header">
        <div>
          <h2>Clientes</h2>
          <p>Consulta de clientes e historial de compras</p>
        </div>

        <span className="clientes-contador">
          {clientes.length} {clientes.length === 1 ? "cliente" : "clientes"}
        </span>
      </div>

      {error && (
        <p className="clientes-error" role="alert">
          {error}
        </p>
      )}

      {clientes.length === 0 ? (
        <p className="clientes-estado">No hay clientes registrados.</p>
      ) : (
        <div className="clientes-contenido">
          <div className="clientes-lista">
            {clientes.map((cliente) => {
              const seleccionado = clienteSeleccionado?.id === cliente.id;

              return (
                <button
                  className={`cliente-item ${
                    seleccionado ? "cliente-item-seleccionado" : ""
                  }`}
                  type="button"
                  key={cliente.id}
                  onClick={() => seleccionarCliente(cliente)}
                >
                  <div className="cliente-item-principal">
                    <strong>{cliente.nombre_completo}</strong>
                    <span>{cliente.email}</span>
                  </div>

                  <div className="cliente-item-resumen">
                    <span>
                      {cliente.cantidad_compras}{" "}
                      {cliente.cantidad_compras === 1 ? "compra" : "compras"}
                    </span>

                    <strong>${formatearPrecio(cliente.total_gastado)}</strong>
                  </div>
                </button>
              );
            })}
          </div>

          {clienteSeleccionado && (
            <div className="cliente-detalle">
              <div className="cliente-detalle-header">
                <div>
                  <h3>{clienteSeleccionado.nombre_completo}</h3>
                  <p>{clienteSeleccionado.email}</p>
                </div>
              </div>

              <div className="cliente-metricas">
                <div className="cliente-metrica">
                  <span>Compras</span>
                  <strong>{clienteSeleccionado.cantidad_compras}</strong>
                </div>

                <div className="cliente-metrica">
                  <span>Total gastado</span>
                  <strong>
                    ${formatearPrecio(clienteSeleccionado.total_gastado)}
                  </strong>
                </div>

                <div className="cliente-metrica">
                  <span>Última compra</span>
                  <strong>
                    {clienteSeleccionado.ultima_compra
                      ? formatearFecha(clienteSeleccionado.ultima_compra)
                      : "Sin compras"}
                  </strong>
                </div>
              </div>

              <div className="cliente-historial-header">
                <div>
                  <h4>Historial de compras</h4>
                  <p>
                    {historial.length === 1
                      ? "1 compra registrada"
                      : `${historial.length} compras registradas`}
                  </p>
                </div>
              </div>

              {cargandoHistorial ? (
                <p className="clientes-estado">Cargando historial...</p>
              ) : historial.length === 0 ? (
                <div className="cliente-sin-compras">
                  <span aria-hidden="true">☕</span>
                  <p>Este cliente todavía no tiene compras.</p>
                </div>
              ) : (
                <div className="cliente-historial">
                  {historial.map((venta) => (
                    <article className="cliente-venta" key={venta.ventaId}>
                      <div className="cliente-venta-header">
                        <div>
                          <strong>Compra #{venta.ventaId}</strong>
                          <span>{formatearFecha(venta.fechaCompra)}</span>
                        </div>

                        <strong className="cliente-venta-total">
                          ${formatearPrecio(venta.totalVenta)}
                        </strong>
                      </div>

                      <div className="cliente-venta-productos">
                        {venta.productos.map((producto) => (
                          <div
                            className="cliente-venta-producto"
                            key={`${venta.ventaId}-${producto.productoId}`}
                          >
                            <div>
                              <strong>{producto.nombre}</strong>

                              <span>
                                {producto.cantidad} × $
                                {formatearPrecio(producto.precioUnitario)}
                              </span>
                            </div>

                            <strong>
                              ${formatearPrecio(producto.subtotal)}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default Clientes;
