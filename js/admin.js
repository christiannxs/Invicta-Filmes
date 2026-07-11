/* Painel de administração — Invicta Filmes */
if (typeof supabase === 'undefined') {
  document.getElementById('login-error').textContent =
    'Não foi possível carregar a biblioteca de login. Desative bloqueadores de anúncio para esta página e recarregue.';
  throw new Error('supabase-js não carregou (CDN bloqueado?)');
}
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const CATS = ['Clipe musical','DVD / Show','Institucional','Documentário','Publicitário','Social media'];
const SETTING_KEYS = ['hero_line','hero_sub','about_p1','about_p2','contact_email','contact_whatsapp','contact_instagram','contact_sub'];

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
  fillSettings(Object.fromEntries((s.data || []).map(r => [r.key, r.value])));
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
        <div><label>Duração (ex: 3:42)</label><input data-f="duration"></div>
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
  videos.unshift({ youtube_id: '', title: '', artist: '', category: CATS[0], duration: '', description: '', show_on_home: false });
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
      duration: (v.duration || '').trim() || null,
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
    const { error } = await sb.from('videos').upsert(rows);
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
    const { error } = await sb.from('clients').upsert(rows);
    if (error) throw error;
    await loadAll();
    setStatus('clients-status', '✓ Salvo com sucesso', 'ok');
  } catch (err) {
    setStatus('clients-status', 'Erro: ' + err.message, 'err');
  }
  btn.disabled = false;
});

/* ── settings ── */
function fillSettings(map) {
  document.querySelectorAll('#settings-form [data-key]').forEach(el => {
    el.value = map[el.dataset.key] ?? '';
  });
  const stats = Array.isArray(map.stats) ? map.stats : [];
  document.querySelectorAll('#settings-form [data-stat]').forEach(el => {
    el.value = stats[Number(el.dataset.stat)]?.[el.dataset.part] ?? '';
  });
}

document.getElementById('save-settings').addEventListener('click', async () => {
  const btn = document.getElementById('save-settings');
  btn.disabled = true;
  setStatus('settings-status', 'Salvando…');
  try {
    const rows = SETTING_KEYS.map(key => ({
      key,
      value: document.querySelector(`#settings-form [data-key="${key}"]`).value.trim(),
    }));
    const stats = [0, 1, 2].map(i => ({
      num: document.querySelector(`[data-stat="${i}"][data-part="num"]`).value.trim(),
      label: document.querySelector(`[data-stat="${i}"][data-part="label"]`).value.trim(),
    })).filter(s => s.num || s.label);
    rows.push({ key: 'stats', value: stats });
    const { error } = await sb.from('site_settings').upsert(rows);
    if (error) throw error;
    setStatus('settings-status', '✓ Salvo com sucesso', 'ok');
  } catch (err) {
    setStatus('settings-status', 'Erro: ' + err.message, 'err');
  }
  btn.disabled = false;
});

refreshAuth();
