import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import CatalogAdminForm from "../components/CatalogAdminForm";
import ImageCarouselModal from "../components/ImageCarouselModal";
import ProductCard from "../components/ProductCard";
import {
  deleteProduct,
  getAllProductsBySectionAdmin,
  getProductsBySection,
  getSectionBySlug,
} from "../lib/catalogApi";
import type { Product, Section } from "../types/catalog";

type CatalogSectionPageProps = {
  isAdmin: boolean;
};

export default function CatalogSectionPage({ isAdmin }: CatalogSectionPageProps) {
  const { sectionSlug = "" } = useParams();
  const [section, setSection] = useState<Section | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSection = useCallback(async () => {
    if (!sectionSlug) return;

    setLoading(true);
    setError("");

    try {
      const nextSection = await getSectionBySlug(sectionSlug);
      setSection(nextSection);

      if (nextSection) {
        const nextProducts = isAdmin
          ? await getAllProductsBySectionAdmin(nextSection.id)
          : await getProductsBySection(nextSection.id);
        setProducts(nextProducts);
      } else {
        setProducts([]);
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudo cargar la sección.",
      );
    } finally {
      setLoading(false);
    }
  }, [isAdmin, sectionSlug]);

  useEffect(() => {
    void loadSection();
  }, [loadSection]);

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(
      "¿Eliminar este producto y sus imágenes? Esta acción no se puede deshacer.",
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      await deleteProduct(product);
      await loadSection();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo eliminar el producto.",
      );
    } finally {
      setLoading(false);
    }
  };

  const openForm = (product: Product | null) => {
    setEditingProduct(product);
    setShowForm(true);
    window.setTimeout(() => {
      document
        .querySelector(".admin-panel")
        ?.scrollIntoView({ block: "start", behavior: "smooth" });
    }, 80);
  };

  return (
    <main className="catalog-page">
      <div className="page-shell">
        <p className="breadcrumb">
          <Link to="/">Inicio</Link> / {section?.name ?? "Catálogo"}
        </p>

        <div className="catalog-header">
          <div>
            <p>Sección</p>
            <h1>{section?.name ?? "Catálogo"}</h1>
            {section?.description && <span>{section.description}</span>}
            {isAdmin && (
              <small className="admin-note">
                Modo administrador activo: puedes editar este catálogo.
              </small>
            )}
          </div>
          <div className="catalog-header-actions">
            {!loading && <span>{products.length} productos</span>}
            {isAdmin && section && (
              <button
                className="primary-button"
                type="button"
                onClick={() => openForm(null)}
              >
                <FiPlus />
                Agregar producto
              </button>
            )}
          </div>
        </div>

        {section && isAdmin && showForm && (
          <CatalogAdminForm
            section={section}
            product={editingProduct}
            productCount={products.length}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
            onSaved={() => {
              setShowForm(false);
              setEditingProduct(null);
              void loadSection();
            }}
          />
        )}

        {error && <p className="form-error page-error">{error}</p>}

        {loading ? (
          <div className="product-grid">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="skeleton product-skeleton" key={index} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                product={product}
                isAdmin={isAdmin}
                onEdit={openForm}
                onDelete={handleDelete}
                onGallery={setSelectedProduct}
                key={product.id}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            {section?.slug === "seccion-3" || section?.slug === "seccion-4"
              ? "Esta sección queda lista para usar más adelante."
              : "No hay productos aún."}
          </div>
        )}
      </div>

      {selectedProduct && (
        <ImageCarouselModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </main>
  );
}
