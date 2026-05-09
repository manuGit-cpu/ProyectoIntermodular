import { useCallback, useEffect, useMemo, useState } from "react";
import BarraNavegacion from "../components/NavBar";
import PiePagina from "../layouts/Footer";
import { supabase } from "../supabase/client";
import { mostrarAlertaApp } from "../utils/appAlert";
import {
  createGalleryCategory,
  deleteGalleryCategory,
  deleteGalleryImage,
  fetchGalleryMaintenanceData,
  getPublicImageUrl,
  uploadGalleryImage,
} from "../services/galleryService";

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getSupabaseErrorMessage(error) {
  return error?.message || error?.error_description || error?.details || "Supabase ha rechazado la operacion.";
}

function Icono({ name, className = "h-5 w-5" }) {
  const paths = {
    folder: (
      <>
        <path d="M3 6.75A2.25 2.25 0 0 1 5.25 4.5h3.1c.6 0 1.17.24 1.59.66l1.18 1.18c.42.42.99.66 1.59.66h6.04A2.25 2.25 0 0 1 21 9.25v7.5A2.25 2.25 0 0 1 18.75 19H5.25A2.25 2.25 0 0 1 3 16.75v-10Z" />
      </>
    ),
    image: (
      <>
        <path d="M4.75 5.25h14.5a1.5 1.5 0 0 1 1.5 1.5v10.5a1.5 1.5 0 0 1-1.5 1.5H4.75a1.5 1.5 0 0 1-1.5-1.5V6.75a1.5 1.5 0 0 1 1.5-1.5Z" />
        <path d="m5 16 4.25-4.25 3 3L14.5 12.5 19 17" />
        <path d="M15.5 9.25h.01" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V5" />
        <path d="m7.5 9.5 4.5-4.5 4.5 4.5" />
        <path d="M5 19h14" />
      </>
    ),
    trash: (
      <>
        <path d="M6 7h12" />
        <path d="M10 11v5" />
        <path d="M14 11v5" />
        <path d="m9 7 .75-2h4.5L15 7" />
        <path d="M8 7v11a1.5 1.5 0 0 0 1.5 1.5h5A1.5 1.5 0 0 0 16 18V7" />
      </>
    ),
    eye: (
      <>
        <path d="M2.5 12s3.25-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3.25 5.5-9.5 5.5S2.5 12 2.5 12Z" />
        <path d="M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      </>
    ),
  };

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-lg border border-brand/12 bg-white px-5 py-4 shadow-[0_10px_26px_rgba(44,44,44,0.06)]">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">{label}</p>
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand/12 text-brand-dark">
          <Icono name={icon} className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 font-display text-4xl leading-none text-copy">{value}</p>
    </div>
  );
}

function DashboardPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [imageForm, setImageForm] = useState({ title: "", file: null });

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId),
    [categories, selectedCategoryId]
  );
  const totalImages = useMemo(
    () => categories.reduce((total, category) => total + (category.galeria_imagenes?.length || 0), 0),
    [categories]
  );
  const selectedImages = selectedCategory?.galeria_imagenes || [];
  const previewImage = selectedImages[0] || categories.flatMap((category) => category.galeria_imagenes || [])[0];

  const loadData = useCallback(async () => {
    setLoading(true);
    const { categories: nextCategories, error } = await fetchGalleryMaintenanceData();

    if (error) {
      mostrarAlertaApp({
        title: "No se pudo cargar la galeria",
        message: error.message,
        variant: "warning",
      });
    }

    setCategories(nextCategories);
    setSelectedCategoryId((current) =>
      nextCategories.some((category) => category.id === current) ? current : nextCategories[0]?.id || ""
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(loadData, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  async function handleCreateCategory(event) {
    event.preventDefault();
    const nombre = categoryName.trim();
    const slug = slugify(nombre);

    if (!nombre || !slug) {
      mostrarAlertaApp({
        title: "Faltan datos",
        message: "Indica al menos un nombre para la categoria.",
        variant: "warning",
      });
      return;
    }

    setSaving(true);
    const { error } = await createGalleryCategory({ nombre });
    setSaving(false);

    if (error) {
      mostrarAlertaApp({ title: "No se creo la categoria", message: getSupabaseErrorMessage(error), variant: "warning" });
      return;
    }

    setCategoryName("");
    setSelectedCategoryId(slug);
    mostrarAlertaApp({ title: "Carpeta creada", message: "Ya puedes subir imagenes ahi.", variant: "success" });
    window.dispatchEvent(new Event("gallery:changed"));
    loadData();
  }

  async function handleUploadImage(event) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!selectedCategory || !imageForm.file) {
      mostrarAlertaApp({
        title: "Seleccion incompleta",
        message: "Elige una categoria y una imagen para subir.",
        variant: "warning",
      });
      return;
    }

    setSaving(true);
    const { error } = await uploadGalleryImage({
      category: selectedCategory,
      file: imageForm.file,
      title: imageForm.title.trim(),
    });
    setSaving(false);

    if (error) {
      mostrarAlertaApp({ title: "No se subio la imagen", message: getSupabaseErrorMessage(error), variant: "warning" });
      return;
    }

    setImageForm({ title: "", file: null });
    form.reset();
    mostrarAlertaApp({ title: "Imagen subida", message: "La galeria publica ya puede usarla.", variant: "success" });
    window.dispatchEvent(new Event("gallery:changed"));
    loadData();
  }

  async function handleDeleteImage(image) {
    const confirmed = window.confirm(`Eliminar "${image.titulo || image.nombre_archivo}"?`);
    if (!confirmed) return;

    const { error } = await deleteGalleryImage(image);
    if (error) {
      mostrarAlertaApp({ title: "No se elimino la imagen", message: error.message, variant: "warning" });
      return;
    }

    mostrarAlertaApp({ title: "Imagen eliminada", message: "Se ha quitado de la galeria.", variant: "success" });
    window.dispatchEvent(new Event("gallery:changed"));
    loadData();
  }

  async function handleDeleteCategory(category) {
    const confirmed = window.confirm(`Eliminar la categoria "${category.nombre}" y sus imagenes?`);
    if (!confirmed) return;

    const { error } = await deleteGalleryCategory(category);
    if (error) {
      mostrarAlertaApp({ title: "No se elimino la categoria", message: error.message, variant: "warning" });
      return;
    }

    mostrarAlertaApp({ title: "Categoria eliminada", message: "Tambien se han borrado sus imagenes.", variant: "success" });
    window.dispatchEvent(new Event("gallery:changed"));
    loadData();
  }

  if (!supabase) {
    return (
      <div className="min-h-screen bg-surface text-copy">
        <BarraNavegacion />
        <main className="mx-auto max-w-4xl px-6 pt-32 pb-20">
          <h1 className="font-display text-5xl">Dashboard</h1>
          <p className="mt-4 text-muted">Configura Supabase para gestionar la galeria.</p>
        </main>
        <PiePagina />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-copy">
      <BarraNavegacion />

      <main className="mx-auto max-w-7xl px-6 pt-28 pb-20 sm:px-10">
        <section className="relative overflow-hidden rounded-lg bg-copy px-6 py-8 text-white shadow-[0_20px_60px_rgba(44,44,44,0.18)] sm:px-8 lg:px-10">
          {previewImage && (
            <img
              className="absolute inset-0 h-full w-full object-cover opacity-28"
              src={getPublicImageUrl(previewImage.storage_path || previewImage.storagePath)}
              alt=""
              aria-hidden="true"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-r from-copy via-copy/86 to-copy/45" />

          <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-brand">Panel privado</p>
              <h1 className="mt-3 font-display text-5xl leading-tight sm:text-6xl">Gestion de galeria</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/76">
                Organiza las carpetas, sube nuevas imagenes y revisa lo que se vera en la galeria publica.
              </p>
            </div>
            <a
              href="/galeria"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/16 bg-white/12 px-4 py-3 text-sm font-bold text-white no-underline backdrop-blur-md transition hover:bg-white/18"
            >
              <Icono name="eye" className="h-4 w-4" />
              Ver galeria
            </a>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard label="Categorias" value={categories.length} icon="folder" />
          <StatCard label="Imagenes" value={totalImages} icon="image" />
          <StatCard label="Seleccion" value={selectedImages.length} icon="upload" />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="grid content-start gap-5">
            <div className="rounded-lg border border-brand/12 bg-white p-5 shadow-[0_14px_34px_rgba(44,44,44,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-2xl">Carpetas</h2>
                <span className="rounded-full bg-brand/12 px-3 py-1 text-xs font-bold text-brand-dark">
                  {categories.length}
                </span>
              </div>

              {loading ? (
                <p className="mt-5 text-sm font-semibold text-muted">Cargando mantenimiento...</p>
              ) : (
                <div className="mt-5 grid gap-2">
                  {categories.map((category) => {
                    const isSelected = category.id === selectedCategoryId;
                    const imageCount = category.galeria_imagenes?.length || 0;

                    return (
                      <button
                        key={category.id}
                        type="button"
                        className={`grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md border px-3 py-3 text-left transition ${
                          isSelected
                            ? "border-brand/35 bg-brand/12 text-copy"
                            : "border-brand/10 bg-surface text-copy hover:border-brand/24 hover:bg-brand/8"
                        }`}
                        onClick={() => setSelectedCategoryId(category.id)}
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-brand-dark">
                          <Icono name="folder" className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold">{category.nombre}</span>
                          <span className="block truncate text-xs font-semibold text-muted">{category.slug}</span>
                        </span>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-muted">{imageCount}</span>
                      </button>
                    );
                  })}

                  {categories.length === 0 && (
                    <p className="rounded-md border border-brand/12 bg-surface p-4 text-sm text-muted">
                      No hay carpetas visibles en el bucket la-galana.
                    </p>
                  )}
                </div>
              )}
            </div>

            <form className="rounded-lg border border-brand/12 bg-white p-5 shadow-[0_14px_34px_rgba(44,44,44,0.08)]" onSubmit={handleCreateCategory}>
              <h2 className="font-display text-2xl">Nueva carpeta</h2>
              <div className="mt-5 grid gap-4">
                <label className="grid gap-2 text-sm font-semibold">
                  Nombre
                  <input
                    className="rounded-md border border-brand/16 px-3 py-2 font-normal outline-none focus:border-brand"
                    value={categoryName}
                    onChange={(event) => setCategoryName(event.target.value)}
                    placeholder="Habitaciones"
                  />
                </label>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-md border-0 bg-brand px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
                >
                  <Icono name="plus" className="h-4 w-4" />
                  Crear categoria
                </button>
              </div>
            </form>
          </aside>

          <div className="grid content-start gap-6">
            <section className="rounded-lg border border-brand/12 bg-white p-5 shadow-[0_14px_34px_rgba(44,44,44,0.08)] sm:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-dark">Carpeta activa</p>
                  <h2 className="mt-2 font-display text-4xl">{selectedCategory?.nombre || "Sin seleccion"}</h2>
                  <p className="mt-2 text-sm font-semibold text-muted">
                    {selectedCategory ? selectedCategory.slug : "Elige o crea una carpeta para empezar."}
                  </p>
                </div>

                {selectedCategory && (
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-red-700/20 bg-red-700/8 px-3 py-2 text-sm font-bold text-red-800 transition hover:bg-red-700/14"
                    onClick={() => handleDeleteCategory(selectedCategory)}
                  >
                    <Icono name="trash" className="h-4 w-4" />
                    Eliminar carpeta
                  </button>
                )}
              </div>

              <form className="mt-6 grid gap-4 rounded-lg border border-brand/10 bg-surface p-4 md:grid-cols-[1fr_1fr_auto] md:items-end" onSubmit={handleUploadImage}>
                <label className="grid gap-2 text-sm font-semibold">
                  Imagen
                  <input
                    className="rounded-md border border-brand/16 bg-white px-3 py-2 font-normal outline-none file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-2 file:text-white"
                    type="file"
                    accept="image/*"
                    onChange={(event) => setImageForm((current) => ({ ...current, file: event.target.files?.[0] || null }))}
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold">
                  Titulo
                  <input
                    className="rounded-md border border-brand/16 bg-white px-3 py-2 font-normal outline-none focus:border-brand"
                    value={imageForm.title}
                    onChange={(event) => setImageForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Dormitorio principal"
                  />
                </label>

                <button
                  type="submit"
                  disabled={saving || !selectedCategoryId}
                  className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-md border-0 bg-accent px-4 py-3 text-sm font-bold text-white transition hover:bg-accent-dark disabled:opacity-60"
                >
                  <Icono name="upload" className="h-4 w-4" />
                  Subir
                </button>
              </form>
            </section>

            <section className="rounded-lg border border-brand/12 bg-white p-5 shadow-[0_14px_34px_rgba(44,44,44,0.08)] sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-display text-3xl">Imagenes</h2>
                  <p className="mt-1 text-sm font-semibold text-muted">
                    {selectedImages.length} elementos en {selectedCategory?.nombre || "la carpeta seleccionada"}
                  </p>
                </div>
              </div>

              {selectedCategory && selectedImages.length > 0 ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {selectedImages.map((image) => (
                    <figure key={image.id} className="group m-0 overflow-hidden rounded-lg border border-brand/10 bg-surface">
                      <div className="relative aspect-[4/3] overflow-hidden bg-copy/6">
                        <img
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          src={getPublicImageUrl(image.storage_path)}
                          alt={image.alt || image.titulo || ""}
                          loading="lazy"
                        />
                        <button
                          type="button"
                          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/55 bg-white/88 text-red-800 shadow-[0_8px_18px_rgba(44,44,44,0.18)] transition hover:bg-red-50"
                          onClick={() => handleDeleteImage(image)}
                          aria-label={`Eliminar ${image.titulo || image.nombre_archivo}`}
                        >
                          <Icono name="trash" className="h-4 w-4" />
                        </button>
                      </div>
                      <figcaption className="grid gap-1 p-4">
                        <span className="truncate text-sm font-bold">{image.titulo || image.nombre_archivo}</span>
                        <span className="truncate text-xs font-semibold text-muted">{image.nombre_archivo}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-lg border border-dashed border-brand/24 bg-surface px-5 py-10 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-white text-brand-dark">
                    <Icono name="image" className="h-6 w-6" />
                  </span>
                  <p className="mt-4 font-display text-2xl">{selectedCategory ? "Carpeta vacia" : "Sin carpeta activa"}</p>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                    {selectedCategory
                      ? "Sube la primera imagen para que aparezca en esta seccion."
                      : "Selecciona una carpeta del panel lateral o crea una nueva."}
                  </p>
                </div>
              )}
            </section>
          </div>
        </section>

      </main>

      <PiePagina />
    </div>
  );
}

export default DashboardPage;
