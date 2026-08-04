import { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import type { Product } from "../types/catalog";

type ImageCarouselModalProps = {
  product: Product;
  onClose: () => void;
};

export default function ImageCarouselModal({
  product,
  onClose,
}: ImageCarouselModalProps) {
  const [index, setIndex] = useState(0);
  const images = product.images ?? [];
  const currentImage = images[index];

  const goTo = (nextIndex: number) => {
    if (images.length === 0) return;
    setIndex(((nextIndex % images.length) + images.length) % images.length);
  };

  return (
    <div className="modal-backdrop gallery-backdrop">
      <div className="gallery-modal" role="dialog" aria-modal="true">
        <button
          className="icon-button modal-close"
          type="button"
          onClick={onClose}
          aria-label="Cerrar galería"
        >
          <FiX />
        </button>

        <div className="gallery-frame">
          {currentImage ? (
            <img src={currentImage} alt={`${product.name} imagen ${index + 1}`} />
          ) : (
            <span>Sin imágenes</span>
          )}
        </div>

        <div className="gallery-footer">
          <button
            className="icon-button"
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Anterior"
            disabled={images.length < 2}
          >
            <FiChevronLeft />
          </button>
          <div>
            <h3>{product.name}</h3>
            <p>
              {images.length > 0 ? index + 1 : 0} / {images.length}
            </p>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Siguiente"
            disabled={images.length < 2}
          >
            <FiChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
