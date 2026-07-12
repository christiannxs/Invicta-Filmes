-- Clientes podem ser cadastrados só com a logo (nome vira opcional)

alter table public.clients alter column name drop not null;
