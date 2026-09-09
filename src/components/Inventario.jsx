import { useEffect, useState } from "react";
import {
  obtenerTodosLosProductos,
  retirarProducto,
  reactivarProducto,
} from "../services/productosService";
import ProductoForm from "./ProductoForm";
import "./Inventario.css";

function Inventario() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [notificacion, setNotificacion] = useState("");

  async function cargarProductos() {
    try {
      setCargando(true);
      setError("");

      const data = await obtenerTodosLosProductos();
      setProductos(data);
    } catch (error) {
      console.error("Error al cargar inventario:", error);
      setError("No fue posible cargar el inventario.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarProductos();
  }, []);

  function mostrarNotificacion(mensaje) {
    setNotificacion(mensaje);

    setTimeout(() => {
      setNotificacion("");
    }, 3500);
  }

  function abrirCrearProducto() {
    setProductoEditando(null);
    setFormularioAbierto(true);
    setError("");
  }

  function abrirEditarProducto(producto) {
    setProductoEditando(producto);
    setFormularioAbierto(true);
    setError("");
  }

  function cerrarFormulario() {
    setFormularioAbierto(false);
    setProductoEditando(null);
  }

  async function manejarGuardado(_producto, tipoOperacion) {
    cerrarFormulario();
    await cargarProductos();

    if (tipoOperacion === "creado") {
      mostrarNotificacion("Producto creado correctamente.");
      return;
    }

    if (tipoOperacion === "actualizado") {
      mostrarNotificacion("Producto actualizado correctamente.");
    }
  }

  async function manejarRetiro(producto) {
    const confirmar = window.confirm(
      `¿Deseas retirar "${producto.nombre}" del catálogo?`,
    );

    if (!confirmar) {
      return;
    }

    try {
      setError("");
      await retirarProducto(producto.id);
      await cargarProductos();
      mostrarNotificacion("Producto retirado correctamente.");
    } catch (error) {
      console.error("Error al retirar producto:", error);
      setError("No fue posible retirar el producto.");
    }
  }

  async function manejarReactivacion(producto) {
    const confirmar = window.confirm(
      `¿Deseas reactivar "${producto.nombre}" en el catálogo?`,
    );

    if (!confirmar) {
      return;
    }

    try {
      setError("");
      await reactivarProducto(producto.id);
      await cargarProductos();
      mostrarNotificacion("Producto reactivado correctamente.");
    } catch (error) {
      console.error("Error al reactivar producto:", error);
      setError("No fue posible reactivar el producto.");
    }
  }

  if (cargando) {
    return (
      <section className="inventario">
        <div className="inventario-header">
          <div>
            <h2>Inventario</h2>
            <p>Gestión de productos y existencias</p>
          </div>
        </div>

        <p className="inventario-estado">Cargando inventario...</p>
      </section>
    );
  }

  return (
    <section className="inventario">
      {notificacion && (
        <div className="inventario-notificacion" role="status">
          <span className="inventario-notificacion-icono">✓</span>
          <span>{notificacion}</span>
        </div>
      )}

      <div className="inventario-header">
        <div>
          <h2>Inventario</h2>
          <p>Gestión de productos y existencias</p>
        </div>

        <div className="inventario-header-acciones">
          <span className="inventario-contador">
            {productos.length} productos
          </span>

          <button
            className="inventario-boton-nuevo"
            type="button"
            onClick={abrirCrearProducto}
          >
            + Nuevo producto
          </button>
        </div>
      </div>

      {error && (
        <p className="inventario-error" role="alert">
          {error}
        </p>
      )}

      {productos.length === 0 ? (
        <p className="inventario-estado">No hay productos registrados.</p>
      ) : (
        <div className="inventario-grid">
          {productos.map((producto) => (
            <article
              className={`producto-inventario ${
                !producto.activo ? "producto-retirado" : ""
              }`}
              key={producto.id}
            >
              <div className="inventario-imagen-container">
                <img
                  className="inventario-imagen"
                  src={producto.imagen_url}
                  alt={producto.nombre}
                />

                <span
                  className={`producto-estado ${
                    producto.activo
                      ? "producto-estado-activo"
                      : "producto-estado-retirado"
                  }`}
                >
                  {producto.activo ? "Activo" : "Retirado"}
                </span>
              </div>

              <div className="inventario-producto-contenido">
                <h3>{producto.nombre}</h3>

                <p className="inventario-producto-precio">
                  ${Number(producto.precio).toLocaleString("es-CO")}
                </p>

                <div className="inventario-producto-stock">
                  <span>Stock</span>

                  <strong
                    className={
                      producto.stock < 5 ? "inventario-stock-bajo" : ""
                    }
                  >
                    {producto.stock} unidades
                  </strong>
                </div>

                <div className="inventario-producto-acciones">
                  <button
                    className="inventario-boton-editar"
                    type="button"
                    onClick={() => abrirEditarProducto(producto)}
                  >
                    Editar
                  </button>

                  {producto.activo ? (
                    <button
                      className="inventario-boton-retirar"
                      type="button"
                      onClick={() => manejarRetiro(producto)}
                    >
                      Retirar
                    </button>
                  ) : (
                    <button
                      className="inventario-boton-reactivar"
                      type="button"
                      onClick={() => manejarReactivacion(producto)}
                    >
                      Reactivar
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {formularioAbierto && (
        <ProductoForm
          producto={productoEditando}
          onGuardado={manejarGuardado}
          onCancelar={cerrarFormulario}
        />
      )}
    </section>
  );
}

export default Inventario;
