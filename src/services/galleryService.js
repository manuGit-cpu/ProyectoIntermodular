import { supabase } from "../supabase/client";
import { GALLERY_SECTIONS as FALLBACK_GALLERY_SECTIONS } from "../data/galleryImages";

const BUCKET_NAME = "la-galana";
const FOLDER_MARKER = ".emptyFolderPlaceholder";
const IMAGE_EXTENSIONS = /\.(avif|gif|jpe?g|png|svg|webp)$/i;
const toneFallbacks = ["accent", "brand", "copy"];

const fallbackTitleByPath = new Map(
  FALLBACK_GALLERY_SECTIONS.flatMap((section) =>
    section.images.map((image) => {
      const path = image.src.split("/images/la-galana/")[1] || image.storagePath || "";
      return [path, image.title];
    })
  )
);

export function getPublicImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  if (!supabase) {
    return `/images/la-galana/${path}`;
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}

function prettifySlug(value = "") {
  return value
    .replace(/\.[^.]+$/, "")
    .replace(/^\d+-/, "")
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function slugify(value = "") {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function isGalleryImage(item) {
  return IMAGE_EXTENSIONS.test(item.name) && item.name !== FOLDER_MARKER;
}

async function listStorageFolders() {
  const { data, error } = await supabase.rpc("listar_carpetas_galeria");

  if (error) return { folders: [], error };

  const folders = [...new Set((data || [])
    .map((item) => item.carpeta)
    .filter(Boolean))]
    .sort();

  return { folders, error: null };
}

async function listAllGalleryImages() {
  const { data, error } = await supabase.rpc("listar_galeria_storage");
  return { rows: data || [], error };
}

async function buildCategoriesFromStorage({ includeEmpty = false } = {}) {
  const { folders, error } = await listStorageFolders();
  if (error) return { categories: [], error };
  const { rows, error: imagesListError } = await listAllGalleryImages();
  if (imagesListError) return { categories: [], error: imagesListError };

  const knownFolders = folders.length
    ? folders
    : [...new Set(rows.map((image) => image.carpeta).filter(Boolean))].sort();

  const categories = knownFolders.map((folder, index) => {
    const images = rows
      .filter((image) => image.carpeta === folder && isGalleryImage({ name: image.nombre_archivo }))
      .map((image) => {
        const storagePath = image.storage_path;
        const title = fallbackTitleByPath.get(storagePath) || prettifySlug(image.nombre_archivo);

        return {
          id: storagePath,
          name: image.nombre_archivo,
          title,
          titulo: title,
          alt: `${title} en Casa Rural La Galana`,
          src: getPublicImageUrl(storagePath),
          storagePath,
          storage_path: storagePath,
          nombre_archivo: image.nombre_archivo,
          created_at: image.created_at,
          updated_at: image.updated_at,
        };
      });

    return {
      id: folder,
      slug: folder,
      nombre: prettifySlug(folder),
      title: prettifySlug(folder),
      descripcion: "",
      intro: "",
      tone: toneFallbacks[index % toneFallbacks.length],
      galeria_imagenes: images,
      images,
    };
  });

  const visibleCategories = includeEmpty
    ? categories
    : categories.filter((category) => category.images.length > 0);

  return { categories: visibleCategories, error: null };
}

export async function fetchGallerySections() {
  if (!supabase) return FALLBACK_GALLERY_SECTIONS;

  const { categories, error } = await buildCategoriesFromStorage();

  if (error) {
    console.warn("No se pudo cargar la galeria desde Supabase Storage", error);
    return [];
  }

  return categories;
}

export async function fetchGalleryMaintenanceData() {
  if (!supabase) return { categories: [], error: new Error("Supabase no esta configurado") };
  return buildCategoriesFromStorage({ includeEmpty: true });
}

export async function createGalleryCategory({ nombre, slug }) {
  const cleanSlug = (slug || slugify(nombre)).trim();

  if (!cleanSlug) {
    return { data: null, error: new Error("La carpeta no puede estar vacia") };
  }

  return supabase.rpc("crear_categoria_galeria", { carpeta_nombre: cleanSlug });
}

export async function uploadGalleryImage({ category, file, title }) {
  const extension = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
  const baseName = title?.trim() || file.name.replace(/\.[^.]+$/, "");
  const safeName = file.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-");
  const safeTitle = baseName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const finalName = title ? `${Date.now()}-${safeTitle}${extension}` : safeName;
  const storagePath = `${category.slug}/${finalName}`;

  return supabase.storage.from(BUCKET_NAME).upload(storagePath, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "image/webp",
  });
}

export async function deleteGalleryImage(image) {
  return supabase.storage.from(BUCKET_NAME).remove([image.storage_path || image.storagePath]);
}

export async function deleteGalleryCategory(category) {
  const { data, error } = await supabase.storage.from(BUCKET_NAME).list(category.slug, {
    limit: 1000,
  });

  if (error) return { data: null, error };

  const paths = (data || []).map((item) => `${category.slug}/${item.name}`);

  if (!paths.length) {
    return supabase.storage.from(BUCKET_NAME).remove([`${category.slug}/${FOLDER_MARKER}`]);
  }

  return supabase.storage.from(BUCKET_NAME).remove(paths);
}

if (import.meta.env.DEV) {
  window.debugGalleryStorage = fetchGallerySections;
}
