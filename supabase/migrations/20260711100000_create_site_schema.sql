-- Schema inicial do site Invicta Filmes:
-- admins, is_admin(), videos, clients, site_settings + RLS + seeds

-- ── ADMINS ──────────────────────────────────────────────────────────────
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

drop policy if exists "admins_select_own" on public.admins;
create policy "admins_select_own" on public.admins
  for select using (user_id = auth.uid());

-- ── VIDEOS (portfólio da home + catálogo) ───────────────────────────────
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  youtube_id text not null,
  title text not null,
  artist text,
  category text not null default 'Clipe musical',
  duration text,
  description text,
  show_on_home boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.videos enable row level security;

drop policy if exists "videos_public_read" on public.videos;
create policy "videos_public_read" on public.videos
  for select using (true);

drop policy if exists "videos_admin_insert" on public.videos;
create policy "videos_admin_insert" on public.videos
  for insert with check (public.is_admin());

drop policy if exists "videos_admin_update" on public.videos;
create policy "videos_admin_update" on public.videos
  for update using (public.is_admin());

drop policy if exists "videos_admin_delete" on public.videos;
create policy "videos_admin_delete" on public.videos
  for delete using (public.is_admin());

create index if not exists videos_sort_idx on public.videos (sort_order);

-- ── CLIENTS ─────────────────────────────────────────────────────────────
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.clients enable row level security;

drop policy if exists "clients_public_read" on public.clients;
create policy "clients_public_read" on public.clients
  for select using (true);

drop policy if exists "clients_admin_insert" on public.clients;
create policy "clients_admin_insert" on public.clients
  for insert with check (public.is_admin());

drop policy if exists "clients_admin_update" on public.clients;
create policy "clients_admin_update" on public.clients
  for update using (public.is_admin());

drop policy if exists "clients_admin_delete" on public.clients;
create policy "clients_admin_delete" on public.clients
  for delete using (public.is_admin());

-- ── SITE SETTINGS (textos e contatos) ───────────────────────────────────
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "settings_public_read" on public.site_settings;
create policy "settings_public_read" on public.site_settings
  for select using (true);

drop policy if exists "settings_admin_insert" on public.site_settings;
create policy "settings_admin_insert" on public.site_settings
  for insert with check (public.is_admin());

drop policy if exists "settings_admin_update" on public.site_settings;
create policy "settings_admin_update" on public.site_settings
  for update using (public.is_admin());

drop policy if exists "settings_admin_delete" on public.site_settings;
create policy "settings_admin_delete" on public.site_settings
  for delete using (public.is_admin());

-- ── SEEDS ───────────────────────────────────────────────────────────────
insert into public.videos (youtube_id, title, artist, category, duration, description, show_on_home, sort_order)
select * from (values
  ('lhCQxreLeAw','PROJETO 01','Artista A','Clipe musical','3:37','Clipe oficial gravado ao vivo.', true, 1),
  ('mpiX5Szs-Xs','PROJETO 02','Artista B','DVD / Show','2:30','Faixa do DVD ao vivo.', true, 2),
  ('XGpuOYFEHe4','PROJETO 03','Artista C','Clipe musical','2:42','Clipe oficial de lançamento.', true, 3),
  ('X82BOrgMeos','PROJETO 04','Artista D','Clipe musical','4:52','Produção audiovisual com direção criativa completa.', true, 4),
  ('-6J3HfX4sbg','PROJETO 05','Artista E','DVD / Show','4:03','Faixa do DVD ao vivo gravado em Fortaleza.', true, 5),
  ('N62whNs7CqQ','PROJETO 06','Artista F','Clipe musical','3:22','Clipe oficial.', true, 6),
  ('P_kzO3v7ixY','PROJETO 07','Artista G','Documentário','3:33','Clipe documental com fotografia do interior.', true, 7),
  ('h_2Gk89is-o','PROJETO 08','Artista H','Clipe musical','3:41','Clipe oficial de lançamento.', true, 8),
  ('48Wc8Sn3kAo','PROJETO 09','Artista I','Clipe musical','2:55','Vídeo oficial.', false, 9),
  ('0QfMe36HW64','PROJETO 10','Artista J','Clipe musical','3:09','Clipe com participação especial.', false, 10),
  ('WYdJCW8FCMs','PROJETO 11','Artista K','Clipe musical','3:41','Clipe oficial.', false, 11),
  ('SNbURUnTYCM','PROJETO 12','Artista L','DVD / Show','3:13','Faixa do DVD.', false, 12)
) as v(youtube_id, title, artist, category, duration, description, show_on_home, sort_order)
where not exists (select 1 from public.videos);

insert into public.clients (name, sort_order)
select * from (values
  ('Marca A',1),('Artista B',2),('Empresa C',3),('Marca D',4),('Artista E',5),
  ('Empresa F',6),('Marca G',7),('Artista H',8),('Empresa I',9),('Marca J',10),
  ('Artista K',11),('Empresa L',12),('Marca M',13),('Artista N',14)
) as c(name, sort_order)
where not exists (select 1 from public.clients);

insert into public.site_settings (key, value) values
  ('hero_line',    '"Produção audiovisual — Fortaleza, CE"'),
  ('hero_sub',     '"Do conceito à entrega final — clipes, campanhas, documentários e conteúdo com padrão cinematográfico."'),
  ('about_p1',     '"A Invicta Filmes nasce da crença de que toda marca, todo artista e toda ideia tem uma história que merece ser contada com cuidado e com padrão."'),
  ('about_p2',     '"Trabalhamos com direção criativa, captação e pós-produção para entregar projetos que emocionam e geram resultado — do palco ao digital."'),
  ('stats',        '[{"num":"80+","label":"Projetos"},{"num":"5","label":"Anos"},{"num":"100%","label":"Dedicação"}]'),
  ('contact_email','"contato@invictafilmes.com"'),
  ('contact_whatsapp','"5585999999999"'),
  ('contact_instagram','"invictafilmes"'),
  ('contact_sub',  '"Fale com a gente e vamos transformar a sua ideia em audiovisual de impacto."')
on conflict (key) do nothing;
