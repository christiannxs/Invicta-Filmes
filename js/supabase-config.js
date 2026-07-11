// Configuração pública do Supabase (a publishable key é segura para expor:
// toda a proteção de escrita é feita por RLS no banco).
const SUPABASE_URL = 'https://ptevuvvztjpzfpapdnmv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_b0QF-50yjpb3Qf71EOyW9g_38XJrcys';

// Fetch simples da API REST (usado nas páginas públicas, sem biblioteca)
async function sbFetch(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase: ${res.status}`);
  return res.json();
}
