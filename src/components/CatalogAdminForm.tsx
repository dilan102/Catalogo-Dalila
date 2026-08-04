import { useEffect, useMemo, useRef, useState } from "react";
import { FiPlus, FiSave, FiTrash2, FiUploadCloud, FiX } from "react-icons/fi";
import {
  deleteProductImages,
  saveProduct,
  uploadProductImage,
} from "../lib/catalogApi";
import type { Product, Section } from "../types/catalog";

type EditingImageEntry = {
  url: string;
  replacementFile: File | null;
};

type CatalogAdminFormProps = {
  section: Section;
  product?: Product | null;
  productCount: number;
  onCancel: () => void;
  onSaved: () => void;
};

type FormState = {
  name: string;
  description: string;
  is_active: boolean;
  is_featured: boolean;
  order: number;
};

const emptyState: FormState = {
  name: "",
  description: "",
  is_active: true,
  is_featured: false,
  order: 0,
};

async function compressImageFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const imageBitmap = await createImageBitmap(file);
  const maxSide = 1600;
  const ratio = Math.min(
    1,
    maxSide / Math.max(imageBitmap.width, imageBitmap.height),
  );
  const width = Math.round(imageBitmap.width * ratio);
  const height = Math.round(imageBitmap.height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) return file;

  context.drawImage(imageBitmap, 0, 0, width, height);

  const compressedBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.82);
  });

  imageBitmap.close();

  if (!compressedBlob) return file;

  return new File([compressedBlob], file.name.replace(/\.[^.]+$/, ".jpg"), {
    type: "image/jpeg",
  });
}

export default function CatalogAdminForm({
  section,
  product,
  productCount,
  onCancel,
  onSaved,
}: CatalogAdminFormProps) {
  const [formState, setFormState] = useState<FormState>(emptyState);
  const [primaryImageFile, setPrimaryImageFile] = useState<File | null>(null);
  const [extraImageFiles, setExtraImageFiles] = useState<File[]>([]);
  const [primaryPreview, setPrimaryPreview] = useState("");
  const [extraPreviews, setExtraPreviews] = useState<string[]>([]);
  const [editingImages, setEditingImages] = useState<EditingImageEntry[]>([]);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  const isEditing = Boolean(product);

  useEffect(() => {
    setFormState(
      product
        ? {
            name: product.name,
            description: product.description ?? "",
            is_active: product.is_active,
            is_featured: product.is_featured,
            order: product.order ?? productCount,
          }
        : { ...emptyState, order: productCount },
    );
    setPrimaryImageFile(null);
    setExtraImageFiles([]);
    setPrimaryPreview("");
    setExtraPreviews([]);
    setEditingImages(
      product?.images.map((url) => ({ url, replacementFile: null })) ?? [],
    );
    setError("");
    setSummary("");
  }, [product, productCount]);

  useEffect(() => {
    return () => {
      if (primaryPreview) URL.revokeObjectURL(primaryPreview);
      extraPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [primaryPreview, extraPreviews]);

  const visibleEditingImages = useMemo(
    () => editingImages.filter((entry) => entry.url || entry.replacementFile),
    [editingImages],
  );

  const uploadFile = async (file: File) => {
    const compressed = await compressImageFile(file);
    const originalKB = (file.size / 1024).toFixed(1);
    const compressedKB = (compressed.size / 1024).toFixed(1);
    setSummary(
      (current) =>
        `${current}${file.name}: ${originalKB}KB -> ${compressedKB}KB\n`,
    );
    return uploadProductImage(section.slug, compressed);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (savingRef.current) return;

    if (!isEditing && !primaryImageFile) {
      setError("La foto principal es obligatoria.");
      return;
    }

    const extraFiles = [
      ...(primaryImageFile ? [primaryImageFile] : []),
      ...extraImageFiles,
    ];

    if (isEditing && visibleEditingImages.length === 0 && extraFiles.length === 0) {
      setError("El producto debe tener al menos una imagen.");
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setError("");
    setSummary("");

    try {
      const nextImages: string[] = [];
      const removedImages: string[] = [];

      for (const entry of editingImages) {
        if (entry.replacementFile) {
          nextImages.push(await uploadFile(entry.replacementFile));
          if (entry.url) removedImages.push(entry.url);
        } else if (entry.url) {
          nextImages.push(entry.url);
        }
      }

      const originalImages = product?.images ?? [];
      originalImages.forEach((url) => {
        const stillPresent = editingImages.some((entry) => entry.url === url);
        if (!stillPresent) removedImages.push(url);
      });

      if (extraFiles.length > 0) {
        const uploaded = await Promise.all(extraFiles.map(uploadFile));
        nextImages.push(...uploaded);
      }

      await saveProduct({
        id: product?.id,
        section_id: section.id,
        name: formState.name,
        description: formState.description.trim() || null,
        images: nextImages,
        is_active: formState.is_active,
        is_featured: formState.is_featured,
        order: Number(formState.order) || productCount,
      });

      if (removedImages.length > 0) {
        await deleteProductImages(removedImages);
      }

      onSaved();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar el producto.",
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <section className="admin-panel">
      <div className="section-heading compact-heading">
        <p>{isEditing ? "Editar catálogo" : "Nuevo producto"}</p>
        <h2>{isEditing ? product?.name : `Agregar a ${section.name}`}</h2>
      </div>

      <form className="catalog-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Nombre del producto
            <input
              value={formState.name}
              onChange={(event) =>
                setFormState({ ...formState, name: event.target.value })
              }
              required
              placeholder="Ej: Lápida mármol claro"
            />
          </label>
          <label>
            Orden
            <input
              type="number"
              min="0"
              value={formState.order}
              onChange={(event) =>
                setFormState({
                  ...formState,
                  order: Number(event.target.value),
                })
              }
            />
          </label>
        </div>

        <label>
          Descripción
          <textarea
            value={formState.description}
            onChange={(event) =>
              setFormState({ ...formState, description: event.target.value })
            }
            rows={4}
            placeholder="Describe materiales, estilo o detalles importantes."
          />
        </label>

        {isEditing && (
          <div className="image-edit-list">
            <div className="form-row-title">
              <span>Imágenes actuales</span>
              <small>Cambia o elimina cada foto.</small>
            </div>
            <div className="edit-image-grid">
              {editingImages.map((entry, index) => (
                <article className="edit-image-card" key={`${entry.url}-${index}`}>
                  <img src={entry.url} alt={`Imagen ${index + 1}`} />
                  {entry.replacementFile && (
                    <span className="replacement-badge">Lista para cambiar</span>
                  )}
                  <div className="edit-image-actions">
                    <label className="secondary-button file-button">
                      Cambiar
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          setEditingImages((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, replacementFile: file }
                                : item,
                            ),
                          );
                        }}
                      />
                    </label>
                    <button
                      className="danger-button"
                      type="button"
                      onClick={() =>
                        setEditingImages((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {!isEditing && (
          <label>
            Foto principal
            <input
              type="file"
              accept="image/*"
              required
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setPrimaryImageFile(file);
                setPrimaryPreview(file ? URL.createObjectURL(file) : "");
              }}
            />
            {primaryPreview && (
              <img className="preview-image" src={primaryPreview} alt="Preview" />
            )}
          </label>
        )}

        <label>
          {isEditing ? "Agregar nuevas fotos" : "Fotos adicionales"}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              setExtraImageFiles(files);
              setExtraPreviews(files.map((file) => URL.createObjectURL(file)));
            }}
          />
        </label>

        {extraPreviews.length > 0 && (
          <div className="preview-grid">
            {extraPreviews.map((preview) => (
              <img src={preview} alt="Preview adicional" key={preview} />
            ))}
          </div>
        )}

        <div className="form-switches">
          <label>
            <input
              type="checkbox"
              checked={formState.is_active}
              onChange={(event) =>
                setFormState({ ...formState, is_active: event.target.checked })
              }
            />
            Producto activo
          </label>
          <label>
            <input
              type="checkbox"
              checked={formState.is_featured}
              onChange={(event) =>
                setFormState({
                  ...formState,
                  is_featured: event.target.checked,
                })
              }
            />
            Destacar en carrusel
          </label>
        </div>

        {summary && <pre className="upload-summary">{summary}</pre>}
        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button className="secondary-button" type="button" onClick={onCancel}>
            <FiX />
            Cancelar
          </button>
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? <FiUploadCloud /> : isEditing ? <FiSave /> : <FiPlus />}
            {saving ? "Guardando..." : "Guardar producto"}
          </button>
        </div>
      </form>
    </section>
  );
}
