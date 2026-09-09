import { useEffect, useState } from "react";
import {
  obtenerIngresosTotales,
  obtenerTopClientes,
  obtenerStockBajo,
  obtenerProductosMasVendidos,
} from "../services/dashboardService";
import "./Dashboard.css";

function formatearMoneda(valor) {
  return `$${Number(valor).toLocaleString("es-CO")}`;
}

function Dashboard() {
  const [ingresos, setIngresos] = useState(0);
  const [topClientes, setTopClientes] = useState([]);
  const [stockBajo, setStockBajo] = useState([]);
  const [productosMasVendidos, setProductosMasVendidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function cargarDashboard() {
    try {
      setCargando(true);
      setError("");

      const [ingresosData, clientesData, stockData, productosData] =
        await Promise.all([
          obtenerIngresosTotales(),
          obtenerTopClientes(),
          obtenerStockBajo(),
          obtenerProductosMasVendidos(),
        ]);

      setIngresos(ingresosData ?? 0);
      setTopClientes(clientesData ?? []);
      setStockBajo(stockData ?? []);
      setProductosMasVendidos(productosData ?? []);
    } catch (err) {
      console.error("Error al cargar dashboard:", err);
      setError("No fue posible cargar la información del dashboard.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDashboard();
  }, []);

  if (cargando) {
    return (
      <main className="dashboard">
        <p className="dashboard-estado">Cargando información del negocio...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard">
        <p className="dashboard-error">{error}</p>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>☕ Resumen del negocio</h1>
          <p>Información general de las operaciones de Coffee Shop</p>
        </div>
      </header>

      <section className="metricas-grid">
        <article className="metrica-card">
          <span className="metrica-icono" aria-hidden="true">
            💰
          </span>

          <div>
            <p>Ingresos totales</p>
            <strong>{formatearMoneda(ingresos)}</strong>
          </div>
        </article>

        <article className="metrica-card">
          <span className="metrica-icono" aria-hidden="true">
            👥
          </span>

          <div>
            <p>Clientes destacados</p>
            <strong>{topClientes.length}</strong>
          </div>
        </article>

        <article className="metrica-card">
          <span className="metrica-icono" aria-hidden="true">
            ⚠️
          </span>

          <div>
            <p>Productos con stock bajo</p>
            <strong>{stockBajo.length}</strong>
          </div>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-card productos-vendidos">
          <div className="card-header">
            <div>
              <h2>🏆 Productos más vendidos</h2>
              <p>Top 5 por unidades vendidas</p>
            </div>
          </div>

          {productosMasVendidos.length === 0 ? (
            <p className="sin-datos">No hay ventas registradas.</p>
          ) : (
            <div className="tabla-container">
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Unidades</th>
                    <th>Ingresos</th>
                  </tr>
                </thead>

                <tbody>
                  {productosMasVendidos.map((producto) => (
                    <tr key={producto.producto_id}>
                      <td>{producto.nombre}</td>
                      <td>{producto.unidades_vendidas}</td>
                      <td>{formatearMoneda(producto.ingresos)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>⚠️ Stock bajo</h2>
              <p>Productos con menos de 5 unidades</p>
            </div>
          </div>

          {stockBajo.length === 0 ? (
            <p className="sin-datos">No hay productos con stock bajo.</p>
          ) : (
            <div className="lista-stock">
              {stockBajo.map((producto) => (
                <div className="stock-item" key={producto.id}>
                  <img
                    src={producto.imagen_url}
                    alt={`Imagen de ${producto.nombre}`}
                  />

                  <div>
                    <strong>{producto.nombre}</strong>

                    <span>
                      {producto.stock}{" "}
                      {producto.stock === 1 ? "unidad" : "unidades"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>👥 Top clientes</h2>
              <p>Clientes con mayor número de compras</p>
            </div>
          </div>

          {topClientes.length === 0 ? (
            <p className="sin-datos">No hay clientes con compras.</p>
          ) : (
            <div className="lista-clientes">
              {topClientes.map((cliente, index) => (
                <div className="cliente-item" key={`${cliente.email}-${index}`}>
                  <span className="cliente-posicion">#{index + 1}</span>

                  <div>
                    <strong>{cliente.nombre_completo}</strong>

                    <span>
                      {cliente.cantidad_compras}{" "}
                      {cliente.cantidad_compras === 1 ? "compra" : "compras"}
                    </span>
                  </div>

                  <strong className="cliente-compras">
                    {cliente.cantidad_compras}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}

export default Dashboard;
