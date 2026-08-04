import type { Section } from "../types/catalog";

export const defaultSections: Section[] = [
  {
    id: "lapidas",
    name: "Lápidas",
    slug: "lapidas",
    description: "Catálogo de lápidas y diseños conmemorativos.",
    image_url: "/Fondo-Seccion_Lapidas.png",
    order: 0,
    is_active: true,
  },
  {
    id: "arreglos",
    name: "Arreglos",
    slug: "arreglos",
    description: "Arreglos florales y detalles para homenajes.",
    image_url: "/Fondo-Seccion_Arreglos.png",
    order: 1,
    is_active: true,
  },
  {
    id: "seccion-3",
    name: "Sección 3",
    slug: "seccion-3",
    description: "Próximamente.",
    image_url: null,
    order: 2,
    is_active: true,
  },
  {
    id: "seccion-4",
    name: "Sección 4",
    slug: "seccion-4",
    description: "Próximamente.",
    image_url: null,
    order: 3,
    is_active: true,
  },
];

export function getDefaultSectionBySlug(slug: string) {
  return defaultSections.find((section) => section.slug === slug) ?? null;
}
