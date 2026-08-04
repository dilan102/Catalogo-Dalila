import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiLogIn } from "react-icons/fi";
import { isSupabaseConfigured, signInAdmin } from "../lib/catalogApi";

type AdminPageProps = {
  onAdminChange: (isAdmin: boolean) => void;
};

export default function AdminPage({ onAdminChange }: AdminPageProps) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInAdmin(username, password);
      onAdminChange(true);
      navigate("/catalogo/lapidas");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "No se pudo iniciar sesión.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-page">
      <section className="admin-login admin-login-page">
        <h1>Acceso admin</h1>
        <p>Ingresa con el usuario autorizado para gestionar el catálogo.</p>
        {!isSupabaseConfigured && (
          <p className="form-error">
            Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
          </p>
        )}
        <form onSubmit={handleLogin} className="admin-login-form">
          <label>
            Usuario
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label>
            Clave
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button" type="submit" disabled={loading}>
            <FiLogIn />
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
        <Link className="admin-back-link" to="/">
          Volver al sitio
        </Link>
      </section>
    </main>
  );
}
