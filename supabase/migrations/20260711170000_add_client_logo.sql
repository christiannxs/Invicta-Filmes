-- Logos dos clientes: imagem exibida no lugar do nome na seção "Clientes" da home

alter table public.clients add column if not exists logo_url text;
