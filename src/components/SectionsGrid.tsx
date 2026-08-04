import { Link } from "react-router-dom";
import ImagePlaceholder from "./ImagePlaceholder";
import type { Section } from "../types/catalog";

type SectionsGridProps = {
  sections: Section[];
};

export default function SectionsGrid({ sections }: SectionsGridProps) {
  return (
    <section className="content-band" id="catalogo">
      <div className="section-heading">
        <p>Catálogo</p>
        <h2>Elige una sección</h2>
      </div>

      <div className="sections-grid">
        {sections.map((section) => (
          <Link
            to={`/catalogo/${section.slug}`}
            className="section-card"
            key={section.id}
          >
            <div className="section-image">
              {section.image_url ? (
                <img src={section.image_url} alt={section.name} loading="lazy" />
              ) : (
                <ImagePlaceholder label="Próximamente" />
              )}
            </div>
            <div className="section-card-body">
              <h3>{section.name}</h3>
              {section.description && <p>{section.description}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
