import { defaultSections, getDefaultSectionBySlug } from "./catalogDefaults";
import { isSupabaseConfigured, supabase } from "./supabase";
import type { Product, ProductDraft, Section } from "../types/catalog";

const bucketName = "product-images";

export { isSupabaseConfigured };

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Falta configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

export function sanitizeFileName(value: string) {
  return value
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_.]/g, "")
    .toLowerCase();
}

export function parseSupabaseImagePath(url: string) {
  const marker = `/object/public/${bucketName}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;

  return url.substring(index + marker.length);
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function signInAdmin(email: string, password: string) {
  const client = requireSupabase();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
}

export async function signOutAdmin() {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function getSections(): Promise<Section[]> {
  if (!isSupabaseConfigured || !supabase) return defaultSections;

  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("is_active", true)
    .order("order", { ascending: true });

  if (error) {
    console.error("Error cargando secciones:", error);
    return defaultSections;
  }

  const sections = (data ?? []) as Section[];
  return sections.length > 0 ? sections : defaultSections;
}

export async function getSectionBySlug(slug: string): Promise<Section | null> {
  if (!isSupabaseConfigured || !supabase) return getDefaultSectionBySlug(slug);

  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    console.error("Error cargando sección:", error);
    return getDefaultSectionBySlug(slug);
  }

  return data as Section;
}

export async function getProductsBySection(sectionId: string) {
  if (!isSupabaseConfigured || !supabase) return [] as Product[];

  const { data, error } = await supabase
    .from("products")
    .select("*, section:sections(*)")
    .eq("section_id", sectionId)
    .eq("is_active", true)
    .order("order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Error al cargar productos: ${error.message}`);
  return (data ?? []) as Product[];
}

export async function getAllProductsBySectionAdmin(sectionId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("products")
    .select("*, section:sections(*)")
    .eq("section_id", sectionId)
    .order("order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Error al cargar productos: ${error.message}`);
  return (data ?? []) as Product[];
}

export async function getLatestProducts(limit = 6) {
  if (!isSupabaseConfigured || !supabase) return [] as Product[];

  const { data, error } = await supabase
    .from("products")
    .select("*, section:sections(*)")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error cargando carrusel:", error);
    return [];
  }

  return (data ?? []) as Product[];
}

export async function uploadProductImage(sectionSlug: string, file: File) {
  const client = requireSupabase();
  const filePath = `${sectionSlug}/${crypto.randomUUID()}-${sanitizeFileName(
    file.name,
  )}`;

  const { error } = await client.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: "3600",
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (error) throw new Error(`No se pudo subir la imagen: ${error.message}`);

  const { data } = client.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function deleteProductImages(urls: string[]) {
  const client = requireSupabase();
  const paths = urls
    .map((url) => parseSupabaseImagePath(url))
    .filter((path): path is string => Boolean(path));

  if (paths.length === 0) return;

  const { error } = await client.storage.from(bucketName).remove(paths);
  if (error) throw new Error(`No se pudieron borrar las imágenes: ${error.message}`);
}

export async function saveProduct(product: ProductDraft) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("products")
    .upsert(product)
    .select("*, section:sections(*)")
    .single();

  if (error) throw new Error(`No se pudo guardar el producto: ${error.message}`);
  return data as Product;
}

export async function deleteProduct(product: Product) {
  const client = requireSupabase();
  await deleteProductImages(product.images ?? []);

  const { error } = await client.from("products").delete().eq("id", product.id);
  if (error) throw new Error(`No se pudo eliminar el producto: ${error.message}`);
}
