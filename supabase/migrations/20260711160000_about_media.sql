-- Quadro visual da seção "Sobre": foto opcional + palavra de fundo editável

insert into public.site_settings (key, value) values
  ('about_media',     '{"type":"text","url":""}'),
  ('about_watermark', '"INVICTA"')
on conflict (key) do nothing;
