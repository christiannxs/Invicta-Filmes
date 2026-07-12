/* Painel de administração — Invicta Filmes */
if (typeof supabase === 'undefined') {
  document.getElementById('login-error').textContent =
    'Não foi possível carregar a biblioteca de login. Desative bloqueadores de anúncio para esta página e recarregue.';
  throw new Error('supabase-js não carregou (CDN bloqueado?)');
}
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const CATS = ['Clipe musical','DVD / Show','Institucional','Documentário','Publicitário','Social media'];

/* Estrutura da aba "Textos & Contatos" — cada campo vira uma chave em site_settings */
const TEXT_SECTIONS = [
  { title: 'Menu e topo (hero)', fields: [
    { key: 'nav_cta',          label: 'Botão do menu ("Falar com a gente")' },
    { key: 'hero_line',        label: 'Linha acima da logo' },
    { key: 'hero_sub',         label: 'Subtítulo do hero', type: 'textarea', full: true },
    { key: 'hero_btn_primary', label: 'Botão principal do hero' },
    { key: 'hero_btn_ghost',   label: 'Botão secundário do hero' },
    { key: 'marquee_items',    label: 'Faixa animada (um item por linha)', type: 'lines', full: true },
  ]},
  { title: 'Portfólio (home)', fields: [
    { key: 'portfolio_label', label: 'Etiqueta da seção' },
    { key: 'portfolio_title', label: 'Título', type: 'textarea' },
    { key: 'portfolio_desc',  label: 'Descrição', type: 'textarea', full: true },
  ]},
  { title: 'Serviços', services: true, fields: [
    { key: 'services_label', label: 'Etiqueta da seção' },
    { key: 'services_title', label: 'Título', type: 'textarea' },
    { key: 'services_intro', label: 'Texto de introdução', type: 'textarea', full: true },
  ]},
  { title: 'Clientes', fields: [
    { key: 'clients_label', label: 'Etiqueta da seção' },
    { key: 'clients_title', label: 'Título' },
  ]},
  { title: 'Sobre', stats: true, fields: [
    { key: 'about_label',  label: 'Etiqueta da seção' },
    { key: 'about_title',  label: 'Título', type: 'textarea' },
    { key: 'about_p1',     label: 'Parágrafo 1', type: 'textarea', full: true },
    { key: 'about_p2',     label: 'Parágrafo 2', type: 'textarea', full: true },
    { key: 'about_visual', label: 'Texto do quadro ao lado ("INVICTA FILMES / EST. 2019")', type: 'textarea', full: true },
    { key: 'about_watermark', label: 'Palavra gigante ao fundo do quadro' },
  ]},
  { title: 'Contato', fields: [
    { key: 'contact_label',     label: 'Etiqueta da seção' },
    { key: 'contact_title',     label: 'Título (*palavra* = destaque)', type: 'textarea' },
    { key: 'contact_sub',       label: 'Frase da seção', type: 'textarea', full: true },
    { key: 'contact_email',     label: 'E-mail de contato' },
    { key: 'contact_whatsapp',  label: 'WhatsApp (só números, com DDI: 5585...)' },
    { key: 'contact_instagram', label: 'Instagram (sem @)' },
  ]},
  { title: 'Rodapé', fields: [
    { key: 'footer_logo', label: 'Nome no rodapé' },
    { key: 'footer_copy', label: 'Texto de direitos (após o ano)' },
  ]},
  { title: 'Página de produções (catálogo)', fields: [
    { key: 'catalog_label', label: 'Etiqueta do topo' },
    { key: 'catalog_title', label: 'Título', type: 'textarea' },
    { key: 'catalog_sub',   label: 'Subtítulo', type: 'textarea', full: true },
  ]},
];
const LINE_KEYS = ['marquee_items']; // campos "um item por linha" salvos como lista

/* Aparência */
const DEFAULT_THEME = { accent: '#0737e8', accent_light: '#4d70ff', accent_hover: '#2a55ff', bg: '#000000', text: '#ededed' };
const DEFAULT_LOGO = 'assets/invicta-logo.png';
let appearance = { theme: { ...DEFAULT_THEME }, site_title: '', favicon_url: '', logo_url: '', hero_media: { type: 'logo', url: '' }, about_media: { type: 'text', url: '' } };

let videos = [];
let deletedVideoIds = [];
let clients = [];
let deletedClientIds = [];

/* ── helpers ── */
function ytId(input) {
  const s = String(input || '').trim();
  const m = s.match(/(?:youtube\.com\/(?:watch\?[^#]*v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (m) return m[1];
  if (/^[\w-]{11}$/.test(s)) return s;
  return s;
}
function setStatus(id, msg, cls) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = 'save-status' + (cls ? ' ' + cls : '');
}

/* ── auth ── */
const loginScreen = document.getElementById('login-screen');
const panel = document.getElementById('panel');

async function refreshAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    loginScreen.hidden = true;
    panel.hidden = false;
    await loadAll();
  } else {
    loginScreen.hidden = false;
    panel.hidden = true;
  }
}

document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  const errEl = document.getElementById('login-error');
  btn.disabled = true; errEl.textContent = '';
  const { error } = await sb.auth.signInWithPassword({
    email: document.getElementById('login-email').value.trim(),
    password: document.getElementById('login-password').value,
  });
  btn.disabled = false;
  if (error) { errEl.textContent = 'E-mail ou senha incorretos.'; return; }
  refreshAuth();
});

document.getElementById('logout-btn').addEventListener('click', async () => {
  await sb.auth.signOut();
  refreshAuth();
});

/* ── tabs ── */
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
  });
});

/* ── load ── */
async function loadAll() {
  const [v, c, s] = await Promise.all([
    sb.from('videos').select('*').order('sort_order'),
    sb.from('clients').select('*').order('sort_order'),
    sb.from('site_settings').select('key,value'),
  ]);
  videos = v.data || [];
  clients = c.data || [];
  deletedVideoIds = []; deletedClientIds = [];
  renderVideos();
  renderClients();
  const map = Object.fromEntries((s.data || []).map(r => [r.key, r.value]));
  fillSettings(map);
  fillAppearance(map);
}

/* ── videos ── */
function renderVideos() {
  const wrap = document.getElementById('video-list');
  wrap.innerHTML = '';
  videos.forEach((v, i) => {
    const row = document.createElement('div');
    row.className = 'video-row' + (v.id ? '' : ' is-new');
    row.innerHTML = `
      <img class="vr-thumb" alt="" loading="lazy">
      <div class="vr-fields">
        <div><label>Título</label><input data-f="title"></div>
        <div><label>Artista</label><input data-f="artist"></div>
        <div class="full"><label>Link ou ID do YouTube</label><input data-f="youtube_id" placeholder="https://www.youtube.com/watch?v=..."></div>
        <div><label>Categoria</label>
          <select data-f="category">${CATS.map(c => `<option>${c}</option>`).join('')}</select>
        </div>
        <div class="full"><label>Descrição curta</label><input data-f="description"></div>
      </div>
      <div class="vr-side">
        <label class="vr-home"><input type="checkbox" data-f="show_on_home"> Home</label>
        <button class="icon-btn" data-act="up" title="Mover para cima">↑</button>
        <button class="icon-btn" data-act="down" title="Mover para baixo">↓</button>
        <button class="icon-btn danger" data-act="del" title="Remover">✕</button>
      </div>`;

    const thumb = row.querySelector('.vr-thumb');
    const updateThumb = () => {
      const id = ytId(v.youtube_id);
      thumb.src = /^[\w-]{11}$/.test(id) ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : '';
    };
    row.querySelectorAll('[data-f]').forEach(input => {
      const f = input.dataset.f;
      if (f === 'show_on_home') input.checked = !!v[f];
      else input.value = v[f] || '';
      input.addEventListener('input', () => {
        v[f] = f === 'show_on_home' ? input.checked : input.value;
        if (f === 'youtube_id') updateThumb();
      });
      if (input.tagName === 'SELECT') input.value = v.category || CATS[0];
    });
    updateThumb();

    row.querySelector('[data-act="up"]').addEventListener('click', () => {
      if (i === 0) return;
      [videos[i - 1], videos[i]] = [videos[i], videos[i - 1]];
      renderVideos();
    });
    row.querySelector('[data-act="down"]').addEventListener('click', () => {
      if (i === videos.length - 1) return;
      [videos[i + 1], videos[i]] = [videos[i], videos[i + 1]];
      renderVideos();
    });
    row.querySelector('[data-act="del"]').addEventListener('click', () => {
      if (!confirm(`Remover "${v.title || 'produção sem título'}"?`)) return;
      if (v.id) deletedVideoIds.push(v.id);
      videos.splice(i, 1);
      renderVideos();
    });

    wrap.appendChild(row);
  });
}

document.getElementById('add-video').addEventListener('click', () => {
  videos.unshift({ youtube_id: '', title: '', artist: '', category: CATS[0], description: '', show_on_home: false });
  renderVideos();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('save-videos').addEventListener('click', async () => {
  const btn = document.getElementById('save-videos');
  btn.disabled = true;
  setStatus('videos-status', 'Salvando…');
  try {
    const rows = videos.map((v, i) => ({
      ...(v.id ? { id: v.id } : {}),
      youtube_id: ytId(v.youtube_id),
      title: (v.title || '').trim() || 'SEM TÍTULO',
      artist: (v.artist || '').trim() || null,
      category: v.category || CATS[0],
      description: (v.description || '').trim() || null,
      show_on_home: !!v.show_on_home,
      sort_order: i + 1,
    }));
    const bad = rows.find(r => !/^[\w-]{11}$/.test(r.youtube_id));
    if (bad) throw new Error(`Link do YouTube inválido em "${bad.title}"`);
    if (deletedVideoIds.length) {
      const { error } = await sb.from('videos').delete().in('id', deletedVideoIds);
      if (error) throw error;
    }
    // defaultToNull:false — linhas novas (sem id) usam o default do banco em vez de null
    const { error } = await sb.from('videos').upsert(rows, { defaultToNull: false });
    if (error) throw error;
    await loadAll();
    setStatus('videos-status', '✓ Salvo com sucesso', 'ok');
  } catch (err) {
    setStatus('videos-status', 'Erro: ' + err.message, 'err');
  }
  btn.disabled = false;
});

/* ── clients ── */
function renderClients() {
  const wrap = document.getElementById('client-list');
  wrap.innerHTML = '';
  clients.forEach((c, i) => {
    const row = document.createElement('div');
    row.className = 'client-row';
    row.innerHTML = `
      <input placeholder="Nome do cliente">
      <button class="icon-btn" data-act="up" title="Mover para cima">↑</button>
      <button class="icon-btn" data-act="down" title="Mover para baixo">↓</button>
      <button class="icon-btn danger" data-act="del" title="Remover">✕</button>`;
    const input = row.querySelector('input');
    input.value = c.name || '';
    input.addEventListener('input', () => { c.name = input.value; });
    row.querySelector('[data-act="up"]').addEventListener('click', () => {
      if (i === 0) return;
      [clients[i - 1], clients[i]] = [clients[i], clients[i - 1]];
      renderClients();
    });
    row.querySelector('[data-act="down"]').addEventListener('click', () => {
      if (i === clients.length - 1) return;
      [clients[i + 1], clients[i]] = [clients[i], clients[i + 1]];
      renderClients();
    });
    row.querySelector('[data-act="del"]').addEventListener('click', () => {
      if (c.id) deletedClientIds.push(c.id);
      clients.splice(i, 1);
      renderClients();
    });
    wrap.appendChild(row);
  });
}

document.getElementById('add-client').addEventListener('click', () => {
  clients.push({ name: '' });
  renderClients();
  const inputs = document.querySelectorAll('#client-list input');
  inputs[inputs.length - 1]?.focus();
});

document.getElementById('save-clients').addEventListener('click', async () => {
  const btn = document.getElementById('save-clients');
  btn.disabled = true;
  setStatus('clients-status', 'Salvando…');
  try {
    const rows = clients
      .filter(c => (c.name || '').trim())
      .map((c, i) => ({ ...(c.id ? { id: c.id } : {}), name: c.name.trim(), sort_order: i + 1 }));
    if (deletedClientIds.length) {
      const { error } = await sb.from('clients').delete().in('id', deletedClientIds);
      if (error) throw error;
    }
    // defaultToNull:false — linhas novas (sem id) usam o default do banco em vez de null
    const { error } = await sb.from('clients').upsert(rows, { defaultToNull: false });
    if (error) throw error;
    await loadAll();
    setStatus('clients-status', '✓ Salvo com sucesso', 'ok');
  } catch (err) {
    setStatus('clients-status', 'Erro: ' + err.message, 'err');
  }
  btn.disabled = false;
});

/* ── settings (textos) ── */
function renderSettingsForm() {
  const wrap = document.getElementById('settings-form');
  wrap.innerHTML = TEXT_SECTIONS.map(sec => `
    <h3 class="settings-sec">${sec.title}</h3>
    <div class="settings-grid">
      ${sec.fields.map(f => `
        <div class="field${f.full ? ' full' : ''}">
          <label>${f.label}</label>
          ${f.type === 'textarea' || f.type === 'lines'
            ? `<textarea data-key="${f.key}" rows="${f.type === 'lines' ? 4 : 3}"></textarea>`
            : `<input data-key="${f.key}">`}
        </div>`).join('')}
      ${sec.services ? `
        <fieldset class="field full stats-fieldset">
          <legend>Cartões de serviço (símbolo, nome e itens — um item por linha)</legend>
          ${[0, 1, 2].map(i => `
            <div class="svc-card" data-svc="${i}">
              <div class="svc-head">
                <input data-part="icon" placeholder="◈" title="Símbolo do cartão">
                <input data-part="name" placeholder="NOME DO SERVIÇO">
              </div>
              <textarea data-part="items" rows="4" placeholder="Um item por linha"></textarea>
            </div>`).join('')}
        </fieldset>` : ''}
      ${sec.stats ? `
        <fieldset class="field full stats-fieldset">
          <legend>Estatísticas (número + rótulo)</legend>
          ${[0, 1, 2].map(i => `
            <div class="stats-row">
              <input data-stat="${i}" data-part="num" placeholder="80+">
              <input data-stat="${i}" data-part="label" placeholder="Projetos">
            </div>`).join('')}
        </fieldset>` : ''}
    </div>`).join('');
}

function fillSettings(map) {
  document.querySelectorAll('#settings-form [data-key]').forEach(el => {
    const k = el.dataset.key;
    const v = map[k];
    if (LINE_KEYS.includes(k)) el.value = Array.isArray(v) ? v.join('\n') : '';
    else el.value = typeof v === 'string' ? v : '';
  });
  const stats = Array.isArray(map.stats) ? map.stats : [];
  document.querySelectorAll('#settings-form [data-stat]').forEach(el => {
    el.value = stats[Number(el.dataset.stat)]?.[el.dataset.part] ?? '';
  });
  const services = Array.isArray(map.services) ? map.services : [];
  document.querySelectorAll('#settings-form .svc-card').forEach(card => {
    const sv = services[Number(card.dataset.svc)] || {};
    card.querySelector('[data-part="icon"]').value = sv.icon || '';
    card.querySelector('[data-part="name"]').value = sv.name || '';
    card.querySelector('[data-part="items"]').value = (sv.items || []).join('\n');
  });
}

document.getElementById('save-settings').addEventListener('click', async () => {
  const btn = document.getElementById('save-settings');
  btn.disabled = true;
  setStatus('settings-status', 'Salvando…');
  try {
    const rows = [];
    document.querySelectorAll('#settings-form [data-key]').forEach(el => {
      const k = el.dataset.key;
      rows.push({
        key: k,
        value: LINE_KEYS.includes(k)
          ? el.value.split('\n').map(l => l.trim()).filter(Boolean)
          : el.value.trim(),
      });
    });
    const stats = [0, 1, 2].map(i => ({
      num: document.querySelector(`[data-stat="${i}"][data-part="num"]`).value.trim(),
      label: document.querySelector(`[data-stat="${i}"][data-part="label"]`).value.trim(),
    })).filter(s => s.num || s.label);
    rows.push({ key: 'stats', value: stats });
    const services = [...document.querySelectorAll('#settings-form .svc-card')].map(card => ({
      icon: card.querySelector('[data-part="icon"]').value.trim(),
      name: card.querySelector('[data-part="name"]').value.trim(),
      items: card.querySelector('[data-part="items"]').value.split('\n').map(l => l.trim()).filter(Boolean),
    })).filter(sv => sv.name || sv.items.length);
    rows.push({ key: 'services', value: services });
    const { error } = await sb.from('site_settings').upsert(rows);
    if (error) throw error;
    setStatus('settings-status', '✓ Salvo com sucesso', 'ok');
  } catch (err) {
    setStatus('settings-status', 'Erro: ' + err.message, 'err');
  }
  btn.disabled = false;
});

/* ── aparência ── */
function hexNorm(v) {
  const s = String(v || '').trim().replace(/^#?/, '#');
  return /^#[0-9a-fA-F]{6}$/.test(s) ? s.toLowerCase() : null;
}
function hexMix(a, b, t) { // mistura a cor "a" com "b" na proporção t (0–1)
  const pa = a.slice(1).match(/../g).map(x => parseInt(x, 16));
  const pb = b.slice(1).match(/../g).map(x => parseInt(x, 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

const AP_COLORS = ['accent', 'bg', 'text'];
function fillAppearance(map) {
  if (map.theme && typeof map.theme === 'object') appearance.theme = { ...DEFAULT_THEME, ...map.theme };
  appearance.site_title = typeof map.site_title === 'string' ? map.site_title : '';
  appearance.favicon_url = typeof map.favicon_url === 'string' ? map.favicon_url : '';
  appearance.logo_url = typeof map.logo_url === 'string' ? map.logo_url : '';
  if (map.hero_media && typeof map.hero_media === 'object') appearance.hero_media = { type: 'logo', url: '', ...map.hero_media };
  if (map.about_media && typeof map.about_media === 'object') appearance.about_media = { type: 'text', url: '', ...map.about_media };

  document.getElementById('ap-site-title').value = appearance.site_title;
  AP_COLORS.forEach(k => {
    const v = hexNorm(appearance.theme[k]) || DEFAULT_THEME[k];
    document.getElementById('ap-c-' + k).value = v;
    document.getElementById('ap-h-' + k).value = v;
  });
  document.getElementById('ap-logo-preview').src = appearance.logo_url || DEFAULT_LOGO;
  document.getElementById('ap-favicon-preview').src = appearance.favicon_url || DEFAULT_LOGO;
  document.querySelector(`[name="hero-media"][value="${appearance.hero_media.type === 'image' ? 'image' : 'logo'}"]`).checked = true;
  updateHeroUploadVisibility();
  updateAboutPreview();
}

function updateHeroUploadVisibility() {
  const isImage = document.querySelector('[name="hero-media"]:checked')?.value === 'image';
  document.getElementById('ap-hero-upload').hidden = !isImage;
  const prev = document.getElementById('ap-hero-preview');
  prev.src = appearance.hero_media.url || '';
  prev.style.display = appearance.hero_media.url ? '' : 'none';
}

function updateAboutPreview() {
  const prev = document.getElementById('ap-about-preview');
  prev.src = appearance.about_media.url || '';
  prev.style.display = appearance.about_media.url ? '' : 'none';
}

// Sincroniza o seletor de cor com o campo de texto hex
AP_COLORS.forEach(k => {
  const picker = document.getElementById('ap-c-' + k);
  const hex = document.getElementById('ap-h-' + k);
  picker.addEventListener('input', () => { hex.value = picker.value; });
  hex.addEventListener('change', () => {
    const v = hexNorm(hex.value);
    if (v) { picker.value = v; hex.value = v; }
    else hex.value = picker.value;
  });
});

document.getElementById('ap-colors-reset').addEventListener('click', () => {
  AP_COLORS.forEach(k => {
    document.getElementById('ap-c-' + k).value = DEFAULT_THEME[k];
    document.getElementById('ap-h-' + k).value = DEFAULT_THEME[k];
  });
});

// Uploads: o botão dispara o input de arquivo escondido
document.querySelectorAll('[data-file]').forEach(btn => {
  btn.addEventListener('click', () => document.getElementById(btn.dataset.file).click());
});

async function uploadAsset(file, name) {
  const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
  const path = `${name}-${Date.now()}.${ext}`;
  const { error } = await sb.storage.from('site-assets').upload(path, file, { cacheControl: '3600', upsert: true });
  if (error) throw error;
  return sb.storage.from('site-assets').getPublicUrl(path).data.publicUrl;
}

function bindUpload(inputId, name, onDone) {
  document.getElementById(inputId).addEventListener('change', async e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setStatus('appearance-status', 'Enviando imagem…');
    try {
      const url = await uploadAsset(file, name);
      onDone(url);
      setStatus('appearance-status', '✓ Imagem enviada — clique em "Salvar aparência" para publicar', 'ok');
    } catch (err) {
      setStatus('appearance-status', 'Erro no envio: ' + err.message, 'err');
    }
  });
}

bindUpload('ap-logo-file', 'logo', url => {
  appearance.logo_url = url;
  document.getElementById('ap-logo-preview').src = url;
});
bindUpload('ap-favicon-file', 'favicon', url => {
  appearance.favicon_url = url;
  document.getElementById('ap-favicon-preview').src = url;
});
bindUpload('ap-hero-file', 'hero', url => {
  appearance.hero_media.url = url;
  updateHeroUploadVisibility();
});
bindUpload('ap-about-file', 'sobre', url => {
  appearance.about_media.url = url;
  updateAboutPreview();
});

document.getElementById('ap-logo-clear').addEventListener('click', () => {
  appearance.logo_url = '';
  document.getElementById('ap-logo-preview').src = DEFAULT_LOGO;
});
document.getElementById('ap-favicon-clear').addEventListener('click', () => {
  appearance.favicon_url = '';
  document.getElementById('ap-favicon-preview').src = DEFAULT_LOGO;
});
document.querySelectorAll('[name="hero-media"]').forEach(r =>
  r.addEventListener('change', updateHeroUploadVisibility));

document.getElementById('save-appearance').addEventListener('click', async () => {
  const btn = document.getElementById('save-appearance');
  btn.disabled = true;
  setStatus('appearance-status', 'Salvando…');
  try {
    const accent = hexNorm(document.getElementById('ap-h-accent').value) || DEFAULT_THEME.accent;
    const theme = {
      accent,
      accent_light: hexMix(accent, '#ffffff', 0.35),
      accent_hover: hexMix(accent, '#ffffff', 0.18),
      bg: hexNorm(document.getElementById('ap-h-bg').value) || DEFAULT_THEME.bg,
      text: hexNorm(document.getElementById('ap-h-text').value) || DEFAULT_THEME.text,
    };
    const heroType = document.querySelector('[name="hero-media"]:checked')?.value === 'image' ? 'image' : 'logo';
    if (heroType === 'image' && !appearance.hero_media.url)
      throw new Error('envie uma foto para o hero ou volte para a opção "Mostrar a logo"');
    // O quadro "Sobre" mostra a foto sempre que houver uma; sem foto, cai no texto
    const aboutType = appearance.about_media.url ? 'image' : 'text';
    const rows = [
      { key: 'theme', value: theme },
      { key: 'site_title', value: document.getElementById('ap-site-title').value.trim() },
      { key: 'favicon_url', value: appearance.favicon_url },
      { key: 'logo_url', value: appearance.logo_url },
      { key: 'hero_media', value: { type: heroType, url: appearance.hero_media.url } },
      { key: 'about_media', value: { type: aboutType, url: appearance.about_media.url } },
    ];
    const { error } = await sb.from('site_settings').upsert(rows);
    if (error) throw error;
    appearance.theme = theme;
    setStatus('appearance-status', '✓ Salvo — recarregue o site para ver', 'ok');
  } catch (err) {
    setStatus('appearance-status', 'Erro: ' + err.message, 'err');
  }
  btn.disabled = false;
});

renderSettingsForm();
refreshAuth();
