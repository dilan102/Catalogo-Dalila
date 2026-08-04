import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { getCurrentUser, signOutAdmin } from "../lib/catalogApi";

type NavbarProps = {
  isAdmin: boolean;
  onAdminChange: (isAdmin: boolean) => void;
};

export default function Navbar({ isAdmin, onAdminChange }: NavbarProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    void getCurrentUser().then((user) => onAdminChange(Boolean(user)));
  }, [onAdminChange]);

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
            <span className="brand-mark" aria-hidden="true">
              ✝
            </span>
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
            {isAdmin && (
              <button className="nav-action" type="button" onClick={handleLogout}>
                <FiLogOut />
                Salir
              </button>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
