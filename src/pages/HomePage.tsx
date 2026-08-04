import { useEffect, useState } from "react";
import Hero from "../Hero/Hero";
import FeaturedCarousel from "../components/FeaturedCarousel";
import SectionsGrid from "../components/SectionsGrid";
import { getLatestProducts, getSections } from "../lib/catalogApi";
import { defaultSections } from "../lib/catalogDefaults";
import type { Product, Section } from "../types/catalog";

export default function HomePage() {
  const [sections, setSections] = useState<Section[]>(defaultSections);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadHome = async () => {
      try {
        const [nextSections, nextProducts] = await Promise.all([
          getSections(),
          getLatestProducts(6),
        ]);

        if (!cancelled) {
          setSections(nextSections);
          setLatestProducts(nextProducts);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadHome();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Hero />
      <main className="home-main">
        <section className="intro-band">
          <div className="intro-copy">
            <p>Atención sobria y personalizada</p>
            <h2>Un catálogo claro para elegir con calma.</h2>
          </div>
          <div className="intro-grid">
            <article>
              <strong>Materiales</strong>
              <span>Opciones resistentes y cuidadas para cada homenaje.</span>
            </article>
            <article>
              <strong>Asesoría</strong>
              <span>Acompañamiento humano durante la elección.</span>
            </article>
            <article>
              <strong>Orden</strong>
              <span>Productos organizados por secciones directas.</span>
            </article>
          </div>
        </section>

        <SectionsGrid sections={sections} />
        <FeaturedCarousel products={latestProducts} loading={loading} />

        <section className="contact-band" id="contacto">
          <div>
            <p>Contacto</p>
            <h2>Estamos para ayudarte.</h2>
          </div>
          <a className="primary-button" href="tel:+570000000000">
            Llamar ahora
          </a>
        </section>
      </main>
    </>
  );
}
