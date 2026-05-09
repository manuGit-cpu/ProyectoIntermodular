-- Galeria dinamica basada en carpetas de Supabase Storage.
-- Cada carpeta dentro del bucket `la-galana` se muestra como una categoria.
-- Ejecutar en Supabase SQL Editor.

insert into storage.buckets (id, name, public)
values ('la-galana', 'la-galana', true)
on conflict (id) do update set public = true;

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    exists (
      select 1
      from public.usuarios
      where id = auth.uid()
        and lower(trim(rol)) in ('admin', 'administrador')
    )
    or lower(trim(coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', ''))) in ('admin', 'administrador')
    or lower(trim(coalesce(auth.jwt() -> 'app_metadata' ->> 'rol', ''))) in ('admin', 'administrador');
$$;

grant execute on function public.es_admin() to authenticated;

drop function if exists public.crear_categoria_galeria(text);
create function public.crear_categoria_galeria(carpeta_nombre text)
returns table (carpeta text)
language plpgsql
security definer
set search_path = public, storage
as $$
declare
  carpeta_limpia text := trim(both '/' from trim(carpeta_nombre));
begin
  if not public.es_admin() then
    raise exception 'No tienes permisos para crear categorias de galeria';
  end if;

  if carpeta_limpia is null or carpeta_limpia = '' then
    raise exception 'La carpeta no puede estar vacia';
  end if;

  insert into storage.objects (bucket_id, name, owner, metadata)
  values ('la-galana', carpeta_limpia || '/.emptyFolderPlaceholder', auth.uid(), '{"mimetype":"text/plain","size":0}'::jsonb)
  on conflict (bucket_id, name) do update
    set updated_at = now();

  return query select carpeta_limpia;
end;
$$;

grant execute on function public.crear_categoria_galeria(text) to authenticated;

drop function if exists public.listar_carpetas_galeria();
create function public.listar_carpetas_galeria()
returns table (carpeta text)
language sql
stable
security definer
set search_path = public, storage
as $$
  select distinct split_part(name, '/', 1) as carpeta
  from storage.objects
  where bucket_id = 'la-galana'
    and position('/' in name) > 0
    and split_part(name, '/', 1) <> ''
  order by carpeta;
$$;

grant execute on function public.listar_carpetas_galeria() to anon, authenticated;

drop function if exists public.listar_imagenes_galeria(text);
create function public.listar_imagenes_galeria(carpeta_nombre text)
returns table (
  storage_path text,
  nombre_archivo text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public, storage
as $$
  select
    name as storage_path,
    regexp_replace(name, '^.*/', '') as nombre_archivo,
    created_at,
    updated_at
  from storage.objects
  where bucket_id = 'la-galana'
    and name like carpeta_nombre || '/%'
    and regexp_replace(name, '^.*/', '') <> '.emptyFolderPlaceholder'
    and regexp_replace(name, '^.*/', '') ~* '\.(avif|gif|jpe?g|png|svg|webp)$'
  order by name;
$$;

grant execute on function public.listar_imagenes_galeria(text) to anon, authenticated;

drop function if exists public.listar_galeria_storage();
create function public.listar_galeria_storage()
returns table (
  carpeta text,
  storage_path text,
  nombre_archivo text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public, storage
as $$
  select
    split_part(name, '/', 1) as carpeta,
    name as storage_path,
    regexp_replace(name, '^.*/', '') as nombre_archivo,
    created_at,
    updated_at
  from storage.objects
  where bucket_id = 'la-galana'
    and position('/' in name) > 0
    and split_part(name, '/', 1) <> ''
  order by carpeta, name;
$$;

grant execute on function public.listar_galeria_storage() to anon, authenticated;

drop policy if exists "Galeria publica lectura storage" on storage.objects;
create policy "Galeria publica lectura storage"
on storage.objects
for select
using (bucket_id = 'la-galana');

drop policy if exists "Admins suben imagenes galeria" on storage.objects;
create policy "Admins suben imagenes galeria"
on storage.objects
for insert
with check (bucket_id = 'la-galana' and public.es_admin());

drop policy if exists "Admins actualizan imagenes galeria" on storage.objects;
create policy "Admins actualizan imagenes galeria"
on storage.objects
for update
using (bucket_id = 'la-galana' and public.es_admin())
with check (bucket_id = 'la-galana' and public.es_admin());

drop policy if exists "Admins borran imagenes galeria" on storage.objects;
create policy "Admins borran imagenes galeria"
on storage.objects
for delete
using (bucket_id = 'la-galana' and public.es_admin());

notify pgrst, 'reload schema';
