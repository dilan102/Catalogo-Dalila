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
            <p>Elegir sin prisa</p>
            <h2>Un catálogo pensado para acompañarte con claridad.</h2>
          </div>
          <div className="intro-grid">
            <article>
              <strong>Materiales</strong>
              <span>Piezas elegidas por su belleza y resistencia.</span>
            </article>
            <article>
              <strong>Asesoría</strong>
              <span>Te escuchamos y resolvemos tus dudas con calma.</span>
            </article>
            <article>
              <strong>Diseño</strong>
              <span>Cada detalle puede reflejar una memoria especial.</span>
            </article>
          </div>
        </section>

        <SectionsGrid sections={sections} />
        <FeaturedCarousel products={latestProducts} loading={loading} />

        <section className="process-band" aria-labelledby="proceso-title">
          <div className="process-intro">
            <p className="eyebrow">Cómo te acompañamos</p>
            <h2 id="proceso-title">Un proceso sereno, de principio a fin.</h2>
          </div>
          <ol className="process-list">
            <li><span>01</span><strong>Cuéntanos qué necesitas</strong><p>Escríbenos y recibe orientación inicial.</p></li>
            <li><span>02</span><strong>Elegimos juntos</strong><p>Revisamos opciones, medidas y detalles.</p></li>
            <li><span>03</span><strong>Creamos tu homenaje</strong><p>Te acompañamos hasta el resultado final.</p></li>
          </ol>
        </section>

        <section className="contact-band" id="contacto">
          <div>
            <p>Hablemos</p>
            <h2>Estamos aquí para orientarte.</h2>
          </div>
          <a className="primary-button" href="tel:+570000000000">
            Solicitar orientación
          </a>
        </section>
      </main>
    </>
  );
}
