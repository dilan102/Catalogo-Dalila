import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiLogIn, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import {
  getCurrentUser,
  isSupabaseConfigured,
  signInAdmin,
  signOutAdmin,
} from "../lib/catalogApi";

type NavbarProps = {
  isAdmin: boolean;
  onAdminChange: (isAdmin: boolean) => void;
};

export default function Navbar({ isAdmin, onAdminChange }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void getCurrentUser().then((user) => onAdminChange(Boolean(user)));
  }, [onAdminChange]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInAdmin(email, password);
      onAdminChange(true);
      setLoginOpen(false);
      setEmail("");
      setPassword("");
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

  const handleLogout = async () => {
    try {
      await signOutAdmin();
    } finally {
      onAdminChange(false);
    }
  };

  const closeMenu = () => setOpen(false);

  return (
    <>
      <header className="site-navbar">
        <div className="navbar-inner">
          <Link to="/" className="brand" onClick={closeMenu}>
            <span className="brand-mark">ME</span>
            <span>
              <strong>Memoria Eterna</strong>
              <small>Catálogo conmemorativo</small>
            </span>
          </Link>

          <button
            className="icon-button menu-button"
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
          >
            {open ? <FiX /> : <FiMenu />}
          </button>

          <nav className={`navbar-links ${open ? "is-open" : ""}`}>
            <a href="/#inicio" onClick={closeMenu}>
              Inicio
            </a>
            <a href="/#catalogo" onClick={closeMenu}>
              Catálogo
            </a>
            <a href="/#contacto" onClick={closeMenu}>
              Contacto
            </a>
            <NavLink to="/catalogo/lapidas" onClick={closeMenu}>
              Lápidas
            </NavLink>
            <NavLink to="/catalogo/arreglos" onClick={closeMenu}>
              Arreglos
            </NavLink>
            {isAdmin ? (
              <button className="nav-action" type="button" onClick={handleLogout}>
                <FiLogOut />
                Salir
              </button>
            ) : (
              <button
                className="nav-action"
                type="button"
                onClick={() => {
                  closeMenu();
                  setLoginOpen(true);
                }}
              >
                <FiLogIn />
                Admin
              </button>
            )}
          </nav>
        </div>
      </header>

      {loginOpen && (
        <div className="modal-backdrop" role="presentation">
          <div className="admin-login" role="dialog" aria-modal="true">
            <button
              className="icon-button modal-close"
              type="button"
              onClick={() => setLoginOpen(false)}
              aria-label="Cerrar"
            >
              <FiX />
            </button>
            <h2>Acceso admin</h2>
            <p>Ingresa con el usuario autorizado en Supabase.</p>
            {!isSupabaseConfigured && (
              <p className="form-error">
                Faltan las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
              </p>
            )}
            <form onSubmit={handleLogin} className="admin-login-form">
              <label>
                Correo
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <label>
                Contraseña
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
              {error && <p className="form-error">{error}</p>}
              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? "Ingresando..." : "Ingresar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
