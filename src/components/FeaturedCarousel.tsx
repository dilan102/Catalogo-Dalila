import { useCallback, useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ImagePlaceholder from "./ImagePlaceholder";
import type { Product } from "../types/catalog";

type FeaturedCarouselProps = {
  products: Product[];
  loading: boolean;
};

export default function FeaturedCarousel({
  products,
  loading,
}: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = useMemo(() => products, [products]);

  const goToIndex = useCallback(
    (nextIndex: number) => {
      if (items.length === 0) return;
      setCurrentIndex(((nextIndex % items.length) + items.length) % items.length);
    },
    [items.length],
  );

  useEffect(() => {
    if (items.length < 2) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((current) => (current + 1) % items.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [items.length]);

  if (!loading && items.length === 0) {
    return (
      <section className="content-band carousel-band">
        <div className="section-heading">
          <p>Novedades</p>
          <h2>Productos recientes</h2>
        </div>
        <div className="empty-state">Aún no hay productos para mostrar.</div>
      </section>
    );
  }

  return (
    <section className="content-band carousel-band">
      <div className="section-heading">
        <p>Novedades</p>
        <h2>Productos recientes</h2>
      </div>

      <div className="featured-carousel">
        <button
          className="carousel-control left"
          type="button"
          onClick={() => goToIndex(currentIndex - 1)}
          disabled={loading || items.length < 2}
          aria-label="Anterior"
        >
          <FiChevronLeft />
        </button>
        <button
          className="carousel-control right"
          type="button"
          onClick={() => goToIndex(currentIndex + 1)}
          disabled={loading || items.length < 2}
          aria-label="Siguiente"
        >
          <FiChevronRight />
        </button>

        <div
          className="carousel-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div className="carousel-slide" key={index}>
                  <div className="skeleton carousel-skeleton" />
                </div>
              ))
            : items.map((product) => (
                <article className="carousel-slide" key={product.id}>
                  <div className="carousel-card">
                    <div className="carousel-image">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} />
                      ) : (
                        <ImagePlaceholder />
                      )}
                    </div>
                    <div className="carousel-copy">
                      <p>{product.section?.name ?? "Catálogo"}</p>
                      <h3>{product.name}</h3>
                      {product.description && <span>{product.description}</span>}
                    </div>
                  </div>
                </article>
              ))}
        </div>
      </div>

      {!loading && items.length > 1 && (
        <div className="carousel-dots">
          {items.map((product, index) => (
            <button
              className={currentIndex === index ? "is-active" : ""}
              type="button"
              onClick={() => goToIndex(index)}
              aria-label={`Ir a ${product.name}`}
              key={product.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}
