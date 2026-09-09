import { useEffect, useState } from "react";
import { obtenerProductos } from "./services/productosService";
import CompraModal from "./components/CompraModal";
import ConfirmacionCompra from "./components/ConfirmacionCompra";

function App() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [confirmacionCompra, setConfirmacionCompra] = useState(null);

  async function cargarProductos() {
    try {
      const data = await obtenerProductos();
      setProductos(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setError("No fue posible cargar los productos.");
    }
  }

  useEffect(() => {
    cargarProductos();
  }, []);

  function manejarCompraExitosa({ resultado, cantidad }) {
    setConfirmacionCompra({
      producto: productoSeleccionado,
      resultado,
      cantidad,
    });

    setProductoSeleccionado(null);

    cargarProductos();
  }

  return (
    <main className="catalogo">
      <header className="encabezado">
        <h1>☕ Coffee Shop</h1>
        <p>Disfruta nuestros productos favoritos</p>
      </header>

      {error && <p>{error}</p>}

      {!error && productos.length === 0 && <p>No hay productos disponibles.</p>}

      <section className="productos-grid">
        {productos.map((producto) => {
          const agotado = producto.stock === 0;

          return (
            <article className="producto-card" key={producto.id}>
              <img
                className="producto-imagen"
                src={producto.imagen_url}
                alt={producto.nombre}
              />

              <div className="producto-contenido">
                <h2>{producto.nombre}</h2>

                <p className="producto-precio">
                  ${Number(producto.precio).toLocaleString("es-CO")}
                </p>

                <p className={`producto-stock ${agotado ? "agotado" : ""}`}>
                  {agotado ? "Agotado" : `Disponible: ${producto.stock}`}
                </p>

                <button
                  className="boton-comprar"
                  disabled={agotado}
                  onClick={() => setProductoSeleccionado(producto)}
                >
                  {agotado ? "Agotado" : "Comprar"}
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {productoSeleccionado && (
        <CompraModal
          producto={productoSeleccionado}
          onClose={() => setProductoSeleccionado(null)}
          onCompraExitosa={manejarCompraExitosa}
        />
      )}

      {confirmacionCompra && (
        <ConfirmacionCompra
          producto={confirmacionCompra.producto}
          resultado={confirmacionCompra.resultado}
          cantidad={confirmacionCompra.cantidad}
          onClose={() => setConfirmacionCompra(null)}
        />
      )}
    </main>
  );
}

export default App;
