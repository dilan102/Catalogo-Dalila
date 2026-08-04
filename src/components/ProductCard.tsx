import { FiEdit2, FiImage, FiTrash2 } from "react-icons/fi";
import ImagePlaceholder from "./ImagePlaceholder";
import type { Product } from "../types/catalog";

type ProductCardProps = {
  product: Product;
  isAdmin?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onGallery?: (product: Product) => void;
};

export default function ProductCard({
  product,
  isAdmin = false,
  onEdit,
  onDelete,
  onGallery,
}: ProductCardProps) {
  const image = product.images?.[0];

  return (
    <article className="product-card">
      <button
        className="product-image-button"
        type="button"
        onClick={() => onGallery?.(product)}
        aria-label={`Ver imágenes de ${product.name}`}
      >
        {image ? (
          <img src={image} alt={product.name} loading="lazy" />
        ) : (
          <ImagePlaceholder />
        )}
        {product.images.length > 1 && (
          <span className="image-count">
            <FiImage />
            {product.images.length}
          </span>
        )}
      </button>

      <div className="product-body">
        <div>
          <p className="product-section">{product.section?.name ?? "Catálogo"}</p>
          <h3>{product.name}</h3>
          {product.description && <p>{product.description}</p>}
        </div>
        {isAdmin && (
          <div className="product-actions">
            <button type="button" onClick={() => onEdit?.(product)}>
              <FiEdit2 />
              Editar
            </button>
            <button
              className="danger-button"
              type="button"
              onClick={() => onDelete?.(product)}
            >
              <FiTrash2 />
              Eliminar
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
