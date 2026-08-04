export interface Section {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  order: number;
  is_active: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  section_id: string;
  name: string;
  description: string | null;
  images: string[];
  is_active: boolean;
  is_featured: boolean;
  order: number;
  created_at: string;
  section?: Section | null;
}

export type ProductDraft = {
  id?: string;
  section_id: string;
  name: string;
  description: string | null;
  images: string[];
  is_active: boolean;
  is_featured: boolean;
  order: number;
};
