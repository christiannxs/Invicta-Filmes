-- Personalização total do site via admin:
-- bucket de imagens (logo, favicon, foto do hero) + novas chaves em site_settings

-- ── STORAGE: bucket público para imagens do site ────────────────────────
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

drop policy if exists "site_assets_public_read" on storage.objects;
create policy "site_assets_public_read" on storage.objects
  for select using (bucket_id = 'site-assets');

drop policy if exists "site_assets_admin_insert" on storage.objects;
create policy "site_assets_admin_insert" on storage.objects
  for insert with check (bucket_id = 'site-assets' and public.is_admin());

drop policy if exists "site_assets_admin_update" on storage.objects;
create policy "site_assets_admin_update" on storage.objects
  for update using (bucket_id = 'site-assets' and public.is_admin());

drop policy if exists "site_assets_admin_delete" on storage.objects;
create policy "site_assets_admin_delete" on storage.objects
  for delete using (bucket_id = 'site-assets' and public.is_admin());

-- ── SITE SETTINGS: aparência ─────────────────────────────────────────────
insert into public.site_settings (key, value) values
  ('theme',       '{"accent":"#0737e8","accent_light":"#4d70ff","accent_hover":"#2a55ff","bg":"#000000","text":"#ededed"}'),
  ('site_title',  '"Invicta Filmes — Produção Audiovisual"'),
  ('favicon_url', '""'),
  ('logo_url',    '""'),
  ('hero_media',  '{"type":"logo","url":""}')
on conflict (key) do nothing;

-- ── SITE SETTINGS: textos da home ────────────────────────────────────────
insert into public.site_settings (key, value) values
  ('nav_cta',          '"Falar com a gente"'),
  ('hero_btn_primary', '"Ver portfólio"'),
  ('hero_btn_ghost',   '"Solicitar orçamento"'),
  ('marquee_items',    '["Clipes","Documentários","Campanhas","Conteúdo","DVDs","Institucional","Social Media","Motion"]'),
  ('portfolio_label',  '"Portfólio"'),
  ('portfolio_title',  '"TRABALHOS\nSELECIONADOS"'),
  ('portfolio_desc',   '"Clique para assistir. Cada projeto é um vídeo direto do YouTube."'),
  ('services_label',   '"O que fazemos"'),
  ('services_title',   '"NOSSOS\nSERVIÇOS"'),
  ('services_intro',   '"Da ideia ao corte final. Trabalhamos com marcas, artistas e empresas que querem conteúdo com identidade e impacto real."'),
  ('services',         '[{"icon":"◈","name":"ESTRATÉGIA & CONCEITO","items":["Roteiro e narrativa","Direção criativa e conceito visual","Moodboard e storyboard"]},{"icon":"◉","name":"PRODUÇÃO & CAPTAÇÃO","items":["Direção de cena e direção de arte","Captação 4K/6K","Iluminação, câmera e áudio","Drone / FPV"]},{"icon":"◎","name":"PÓS & ENTREGA","items":["Edição e finalização","Colorização cinematográfica","Motion / VFX","Formatos para Reels, YouTube e TV"]}]'),
  ('clients_label',    '"Quem confia na Invicta"'),
  ('clients_title',    '"CLIENTES"'),
  ('about_label',      '"Sobre a produtora"'),
  ('about_title',      '"FEITA PRA\nCONTAR O\nQUE IMPORTA"'),
  ('about_visual',     '"INVICTA FILMES\nEST. 2019"'),
  ('contact_label',    '"Vamos trabalhar juntos"'),
  ('contact_title',    '"TEM UM\nPROJETO\nEM *MENTE?*"'),
  ('footer_logo',      '"INVICTA FILMES"'),
  ('footer_copy',      '"Todos os direitos reservados"')
on conflict (key) do nothing;

-- ── SITE SETTINGS: textos do catálogo ────────────────────────────────────
insert into public.site_settings (key, value) values
  ('catalog_label', '"Portfólio completo"'),
  ('catalog_title', '"NOSSAS\nPRODUÇÕES"'),
  ('catalog_sub',   '"Clipes, DVDs, campanhas institucionais e muito mais. Clique em qualquer vídeo para assistir."')
on conflict (key) do nothing;
