// Catálogo — conteúdo carregado do Supabase, com fallback local se estiver offline.
const FALLBACK = [
  { id:'lhCQxreLeAw', title:'PROJETO 01', artist:'Artista A', cat:'Clipe musical', desc:'Clipe oficial gravado ao vivo.' },
  { id:'mpiX5Szs-Xs', title:'PROJETO 02', artist:'Artista B', cat:'DVD / Show', desc:'Faixa do DVD ao vivo.' },
  { id:'XGpuOYFEHe4', title:'PROJETO 03', artist:'Artista C', cat:'Clipe musical', desc:'Clipe oficial de lançamento.' },
  { id:'X82BOrgMeos', title:'PROJETO 04', artist:'Artista D', cat:'Clipe musical', desc:'Produção audiovisual com direção criativa completa.' },
  { id:'-6J3HfX4sbg', title:'PROJETO 05', artist:'Artista E', cat:'DVD / Show', desc:'Faixa do DVD ao vivo gravado em Fortaleza.' },
  { id:'N62whNs7CqQ', title:'PROJETO 06', artist:'Artista F', cat:'Clipe musical', desc:'Clipe oficial.' },
  { id:'P_kzO3v7ixY', title:'PROJETO 07', artist:'Artista G', cat:'Documentário', desc:'Clipe documental com fotografia do interior.' },
  { id:'h_2Gk89is-o', title:'PROJETO 08', artist:'Artista H', cat:'Clipe musical', desc:'Clipe oficial de lançamento.' },
];

let videos = [];
let currentCat = 'todos';

// esc vem de supabase-config.js
function thumb(id) { return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`; }
function thumbFb(id) { return `https://img.youtube.com/vi/${id}/hqdefault.jpg`; }

function renderGrid() {
  const grid = document.getElementById('catalog-grid');
  const list = currentCat === 'todos' ? videos : videos.filter(v => v.cat === currentCat);
  document.getElementById('count-label').textContent =
    `${list.length} ${list.length === 1 ? 'produção' : 'produções'}`;

  if (!list.length) {
    grid.innerHTML = '<div class="empty-state" style="display:block;"><p>Nenhuma produção nessa categoria ainda.</p></div>';
    return;
  }

  grid.innerHTML = list.map((v, i) => `
    <div class="video-card" role="button" tabindex="0" data-i="${i}" aria-label="Assistir ${esc(v.title)}">
      <div class="card-thumb">
        <img src="${thumb(v.id)}" onerror="this.src='${thumbFb(v.id)}'" alt="${esc(v.title)}" loading="lazy">
        <div class="play-btn">
          <svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="30"/><polygon points="23,18 45,30 23,42"/></svg>
        </div>
      </div>
      <div class="card-info">
        <span class="card-tag">${esc(v.cat)}</span>
        <div class="card-title">${esc(v.title)}</div>
        ${v.artist ? `<div class="card-artist">${esc(v.artist)}</div>` : ''}
        ${v.desc ? `<div class="card-desc">${esc(v.desc)}</div>` : ''}
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.video-card').forEach(card => {
    const v = list[Number(card.dataset.i)];
    const open = () => openLb(v.id, v.title);
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });
}

function filter(btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentCat = btn.dataset.cat;
  renderGrid();
}

// Carrega do Supabase (fallback local)
(async function init() {
  try {
    const [rows, settings] = await Promise.all([
      sbFetch('videos?select=youtube_id,title,artist,category,description&order=sort_order.asc'),
      sbFetch('site_settings?select=key,value'),
    ]);
    videos = rows.length
      ? rows.map(r => ({ id:r.youtube_id, title:r.title, artist:r.artist, cat:r.category, desc:r.description }))
      : FALLBACK;
    const s = Object.fromEntries(settings.map(r => [r.key, r.value]));
    applyBranding(s);
    applyTexts(s);
  } catch (err) {
    videos = FALLBACK;
  }
  renderGrid();
})();

// Lightbox
function openLb(id, title) {
  document.getElementById('lb-frame').src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
  document.getElementById('lb-label').textContent = title;
  document.getElementById('lightbox').classList.add('active');
  document.body.style.overflow = 'hidden';
  document.getElementById('lb-close').focus();
}
function closeLb() {
  document.getElementById('lightbox').classList.remove('active');
  document.getElementById('lb-frame').src = '';
  document.body.style.overflow = '';
}
document.getElementById('lb-close').addEventListener('click', closeLb);
document.getElementById('lightbox').addEventListener('click', e => {
  if (e.target === document.getElementById('lightbox')) closeLb();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });

renderGrid();
