# Invicta Filmes — Regras do Projeto

## Stack

- Site público: HTML + CSS + JavaScript puro (estático, sem build)
- Backend: Supabase (PostgreSQL + Auth + Storage)
- Painel admin: `admin.html` (página oculta, login via Supabase Auth)
- Idioma da UI: Português Brasileiro

## Supabase

- Project ref: `ptevuvvztjpzfpapdnmv`
- URL: `https://ptevuvvztjpzfpapdnmv.supabase.co`
- Publishable key (pública, usada no front): `sb_publishable_b0QF-50yjpb3Qf71EOyW9g_38XJrcys`
- CLI: usar `npx supabase` (não há instalação global nem Homebrew nesta máquina)

## Modificações no banco de dados (Supabase)

Sempre que uma alteração no banco de dados for necessária (nova tabela, coluna,
função, política RLS, índice, trigger, etc.), siga obrigatoriamente este fluxo:

### 1. Criar o arquivo de migration

Crie um arquivo SQL em `supabase/migrations/` com o nome no formato:

```
YYYYMMDDHHMMSS_descricao_curta.sql
```

Exemplos:
- `20260424120000_add_store_phone.sql`
- `20260424130000_create_notifications_table.sql`

Use o timestamp atual no momento da criação. A descrição deve ser em
snake_case e resumir o que a migration faz.

### 2. Aplicar a migration no banco

Após criar o arquivo, execute:

```sh
npx supabase db push --password "$SUPABASE_DB_PASSWORD"
```

O CLI vai mostrar quais migrations serão aplicadas. Confirme com `Y`.
(A senha do banco fica com o dono do projeto; não deve ser commitada.)

### 3. Atualizar os tipos TypeScript (se necessário)

Regra aplicável apenas se/quando o projeto migrar para TypeScript
(`src/integrations/supabase/types.ts`). No estágio atual (JS puro) não há
arquivo de tipos.

## Regras gerais

- Nunca modifique o banco diretamente sem criar a migration correspondente.
- Sempre use `IF NOT EXISTS` / `IF EXISTS` / `CREATE OR REPLACE` nas
  migrations para torná-las idempotentes.
- Funções de acesso restrito devem usar `SECURITY DEFINER` e verificar a role
  do usuário com `public.is_admin()`.
- Toda tabela pública deve ter RLS habilitado: leitura liberada (`anon`),
  escrita apenas para admin (`public.is_admin()`).
- O painel admin (`admin.html`) não deve ser linkado em nenhuma página pública.
- Textos e conteúdo editável do site vivem no banco (tabelas `videos`,
  `clients`, `site_settings`); os valores no JS são apenas fallback offline.
