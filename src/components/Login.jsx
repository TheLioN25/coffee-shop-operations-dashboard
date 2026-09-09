import { useState } from "react";
import { supabase } from "../lib/supabase";
import "./Login.css";

function Login({ onVolver }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function manejarInicioSesion(event) {
    event.preventDefault();

    setError("");
    setCargando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      console.error("Error al iniciar sesión:", error);
      setError("Correo o contraseña incorrectos.");
    }

    setCargando(false);
  }

  return (
    <main className="login">
      <section className="login-card">
        <div className="login-icono" aria-hidden="true">
          ☕
        </div>

        <h1>Administración</h1>

        <p className="login-descripcion">
          Ingresa tus credenciales para acceder al área administrativa.
        </p>

        <form onSubmit={manejarInicioSesion}>
          <div className="login-campo">
            <label htmlFor="email">Correo electrónico</label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@coffeeshop.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="login-campo">
            <label htmlFor="password">Contraseña</label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button className="login-boton" type="submit" disabled={cargando}>
            {cargando ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <button className="login-volver" type="button" onClick={onVolver}>
          ← Volver al catálogo
        </button>
      </section>
    </main>
  );
}

export default Login;
