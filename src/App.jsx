import { useEffect, useState } from "react";
import { obtenerProductos } from "./services/productosService";
import CompraModal from "./components/CompraModal";
import ConfirmacionCompra from "./components/ConfirmacionCompra";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import { supabase } from "./lib/supabase";
import { verificarAdministrador } from "./services/authService";

function App() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [confirmacionCompra, setConfirmacionCompra] = useState(null);
  const [vista, setVista] = useState("catalogo");
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  // null = todavía verificando permisos
  // true = administrador
  // false = no administrador
  const [esAdministrador, setEsAdministrador] = useState(null);

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

  // Gestiona únicamente la sesión.
  // No realizamos llamadas RPC dentro de onAuthStateChange.
  useEffect(() => {
    async function cargarSesion() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUsuario(session?.user ?? null);
      setEsAdministrador(null);
      setCargandoSesion(false);
    }

    cargarSesion();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null);
      setEsAdministrador(null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Verifica los permisos del usuario por separado.
  useEffect(() => {
    if (!usuario) {
      setEsAdministrador(false);
      return;
    }

    let cancelado = false;

    async function comprobarAdministrador() {
      try {
        const administrador = await verificarAdministrador();

        if (!cancelado) {
          setEsAdministrador(administrador);
        }
      } catch (error) {
        console.error("Error al verificar permisos:", error);

        if (!cancelado) {
          setEsAdministrador(false);
        }
      }
    }

    comprobarAdministrador();

    return () => {
      cancelado = true;
    };
  }, [usuario]);

  // Controla la navegación después de determinar los permisos.
  useEffect(() => {
    if (!usuario || esAdministrador === null) {
      return;
    }

    if (vista !== "login") {
      return;
    }

    if (esAdministrador === true) {
      setVista("dashboard");
      return;
    }

    if (esAdministrador === false) {
      setVista("acceso-denegado");
    }
  }, [usuario, esAdministrador, vista]);

  function abrirAdministracion() {
    if (!usuario) {
      setVista("login");
      return;
    }

    if (esAdministrador === true) {
      setVista("dashboard");
      return;
    }

    if (esAdministrador === false) {
      setVista("acceso-denegado");
      return;
    }

    setVista("login");
  }

  function volverAlCatalogo() {
    setVista("catalogo");
  }

  async function cerrarSesion() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error al cerrar sesión:", error);
      return;
    }

    setUsuario(null);
    setEsAdministrador(false);
    setVista("catalogo");
  }

  function manejarCompraExitosa({ resultado, cantidad }) {
    setConfirmacionCompra({
      producto: productoSeleccionado,
      resultado,
      cantidad,
    });

    setProductoSeleccionado(null);

    cargarProductos();
  }

  if (cargandoSesion) {
    return (
      <main className="estado-aplicacion">
        <p>Cargando aplicación...</p>
      </main>
    );
  }

  if (vista === "login") {
    return <Login onVolver={volverAlCatalogo} />;
  }

  if (vista === "acceso-denegado") {
    return (
      <main className="estado-aplicacion">
        <div>
          <h1>Acceso denegado</h1>

          <p>
            Tu cuenta está autenticada, pero no tiene permisos para acceder al
            área administrativa.
          </p>

          <button className="boton-dashboard" onClick={volverAlCatalogo}>
            ← Volver al catálogo
          </button>

          <button className="boton-dashboard" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      </main>
    );
  }

  if (vista === "dashboard") {
    if (!usuario) {
      return <Login onVolver={volverAlCatalogo} />;
    }

    if (esAdministrador === null) {
      return (
        <main className="estado-aplicacion">
          <p>Verificando permisos...</p>
        </main>
      );
    }

    if (esAdministrador === false) {
      return (
        <main className="estado-aplicacion">
          <div>
            <h1>Acceso denegado</h1>

            <p>
              Tu cuenta no tiene permisos para acceder al área administrativa.
            </p>

            <button className="boton-dashboard" onClick={volverAlCatalogo}>
              ← Volver al catálogo
            </button>

            <button className="boton-dashboard" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </div>
        </main>
      );
    }

    return (
      <>
        <div className="barra-administracion">
          <span>Área administrativa</span>

          <button className="boton-cerrar-sesion" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </div>

        <button className="boton-volver-dashboard" onClick={volverAlCatalogo}>
          ← Volver al catálogo
        </button>

        <Dashboard />
      </>
    );
  }

  return (
    <main className="catalogo">
      <header className="encabezado">
        <h1>☕ Coffee Shop</h1>
        <p>Disfruta nuestros productos favoritos</p>
      </header>

      <nav className="navegacion-catalogo" aria-label="Navegación principal">
        <button className="boton-dashboard" onClick={abrirAdministracion}>
          🔐 Administración
        </button>
      </nav>

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
