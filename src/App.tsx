import { useCallback, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import AdminPage from "./pages/AdminPage";
import CatalogSectionPage from "./pages/CatalogSectionPage";
import HomePage from "./pages/HomePage";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const handleAdminChange = useCallback((nextIsAdmin: boolean) => {
    setIsAdmin(nextIsAdmin);
  }, []);

  return (
    <BrowserRouter>
      <Navbar isAdmin={isAdmin} onAdminChange={handleAdminChange} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/admin"
          element={<AdminPage onAdminChange={handleAdminChange} />}
        />
        <Route
          path="/catalogo/:sectionSlug"
          element={<CatalogSectionPage isAdmin={isAdmin} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
