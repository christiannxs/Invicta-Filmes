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

/* ── Personalização (tema, identidade e textos vindos de site_settings) ── */
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Converte texto salvo no admin em HTML seguro:
// quebra de linha vira <br> e *palavra* vira <em>palavra</em> (destaque)
function fmtSetting(v) {
  return esc(v).replace(/\*([^*\n]+)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
}

// Preenche todo elemento marcado com data-s="chave" com o texto salvo
function applyTexts(s) {
  document.querySelectorAll('[data-s]').forEach(el => {
    const v = s[el.dataset.s];
    if (typeof v === 'string' && v) el.innerHTML = fmtSetting(v);
  });
}

// Cores do tema como variáveis CSS
function applyThemeVars(theme) {
  if (!theme || typeof theme !== 'object') return;
  const map = { accent: '--accent', accent_light: '--accent-light', accent_hover: '--accent-hover', bg: '--bg', text: '--text' };
  for (const k in map) {
    if (typeof theme[k] === 'string' && theme[k]) document.documentElement.style.setProperty(map[k], theme[k]);
  }
}

// Tema + título da aba + favicon + logo da navegação
function applyBranding(s) {
  if (s.theme) {
    applyThemeVars(s.theme);
    try { localStorage.setItem('invicta_theme', JSON.stringify(s.theme)); } catch (e) {}
  }
  if (typeof s.site_title === 'string' && s.site_title) document.title = s.site_title;
  if (typeof s.favicon_url === 'string' && s.favicon_url) {
    let link = document.querySelector('link[rel="icon"]');
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.href = s.favicon_url;
  }
  if (typeof s.logo_url === 'string' && s.logo_url) {
    document.querySelectorAll('.nav-logo img').forEach(img => { img.src = s.logo_url; });
  }
}

// Aplica imediatamente o último tema salvo (evita "piscada" das cores padrão).
// O admin usa data-no-theme para manter o visual neutro do painel.
if (!document.documentElement.hasAttribute('data-no-theme')) {
  try { applyThemeVars(JSON.parse(localStorage.getItem('invicta_theme'))); } catch (e) {}
}
