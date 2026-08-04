-- Supabase setup para Catálogo Simple en Vite.
-- Ejecuta este script en el SQL Editor de Supabase y luego crea/invita
-- el usuario admin en Authentication > Users.

create extension if not exists pgcrypto;

create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  "order" integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections(id) on delete cascade,
  name text not null,
  description text,
  images text[] not null default '{}',
  is_active boolean not null default true,
  is_featured boolean not null default false,
  "order" integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

insert into public.sections (name, slug, description, "order", is_active)
values
  ('Lápidas', 'lapidas', 'Catálogo de lápidas y diseños conmemorativos.', 0, true),
  ('Arreglos', 'arreglos', 'Arreglos florales y detalles para homenajes.', 1, true),
  ('Sección 3', 'seccion-3', 'Próximamente.', 2, true),
  ('Sección 4', 'seccion-4', 'Próximamente.', 3, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  "order" = excluded."order",
  is_active = excluded.is_active;

alter table public.sections enable row level security;
alter table public.products enable row level security;
alter table public.admin_users enable row level security;

create or replace function public.is_catalog_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
  );
$$;

drop policy if exists "public read active sections" on public.sections;
create policy "public read active sections"
on public.sections for select
to anon, authenticated
using (is_active = true or public.is_catalog_admin());

drop policy if exists "admin write sections" on public.sections;
create policy "admin write sections"
on public.sections for all
to authenticated
using (public.is_catalog_admin())
with check (public.is_catalog_admin());

drop policy if exists "public read active products" on public.products;
create policy "public read active products"
on public.products for select
to anon, authenticated
using (is_active = true or public.is_catalog_admin());

drop policy if exists "admin write products" on public.products;
create policy "admin write products"
on public.products for all
to authenticated
using (public.is_catalog_admin())
with check (public.is_catalog_admin());

drop policy if exists "admin read admin users" on public.admin_users;
create policy "admin read admin users"
on public.admin_users for select
to authenticated
using (public.is_catalog_admin());

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public read product images" on storage.objects;
create policy "public read product images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

drop policy if exists "admin upload product images" on storage.objects;
create policy "admin upload product images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and public.is_catalog_admin());

drop policy if exists "admin update product images" on storage.objects;
create policy "admin update product images"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and public.is_catalog_admin())
with check (bucket_id = 'product-images' and public.is_catalog_admin());

drop policy if exists "admin delete product images" on storage.objects;
create policy "admin delete product images"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and public.is_catalog_admin());

-- Después de crear el usuario admin en Supabase Auth, ejecuta:
-- insert into public.admin_users (user_id) values ('UUID_DEL_USUARIO');
