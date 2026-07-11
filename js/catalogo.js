const CATS = ['Clipe musical','DVD / Show','Institucional','Documentário','Publicitário','Social media'];

const DEFAULTS = [
  { id:'lhCQxreLeAw', title:'PROJETO 01', artist:'Artista A', cat:'Clipe musical', dur:'3:37', desc:'Clipe oficial gravado ao vivo com produção VTX Filmes.' },
  { id:'mpiX5Szs-Xs', title:'PROJETO 02', artist:'Artista B', cat:'DVD / Show', dur:'2:30', desc:'Faixa do DVD ao vivo com direção de Victor Teixeira.' },
  { id:'XGpuOYFEHe4', title:'PROJETO 03', artist:'Artista C', cat:'Clipe musical', dur:'2:42', desc:'Clipe oficial de lançamento.' },
  { id:'X82BOrgMeos', title:'PROJETO 04', artist:'Artista D', cat:'Clipe musical', dur:'4:52', desc:'Produção audiovisual com direção criativa completa.' },
  { id:'-6J3HfX4sbg', title:'PROJETO 05', artist:'Artista E', cat:'DVD / Show', dur:'4:03', desc:'Faixa do DVD ao vivo gravado em Fortaleza.' },
  { id:'N62whNs7CqQ', title:'PROJETO 06', artist:'Artista F', cat:'Clipe musical', dur:'3:22', desc:'Clipe oficial com produção VTX Filmes.' },
  { id:'P_kzO3v7ixY', title:'PROJETO 07', artist:'Artista G', cat:'Documentário', dur:'3:33', desc:'Clipe documental com fotografia do interior.' },
  { id:'h_2Gk89is-o', title:'PROJETO 08', artist:'Artista H', cat:'Clipe musical', dur:'3:41', desc:'Clipe oficial de lançamento.' },
  { id:'48Wc8Sn3kAo', title:'PROJETO 09', artist:'Artista I', cat:'Clipe musical', dur:'2:55', desc:'Video oficial com direção VTX Films.' },
  { id:'0QfMe36HW64', title:'PROJETO 10', artist:'Artista J', cat:'Clipe musical', dur:'3:09', desc:'Clipe com participação especial.' },
  { id:'WYdJCW8FCMs', title:'PROJETO 11', artist:'Artista K', cat:'Clipe musical', dur:'3:41', desc:'Clipe oficial.' },
  { id:'SNbURUnTYCM', title:'PROJETO 12', artist:'Artista L', cat:'DVD / Show', dur:'3:13', desc:'Faixa do DVD.' },
];

let videos = JSON.parse(localStorage.getItem('inv_cat') || 'null') || DEFAULTS;
let currentCat = 'todos';

function thumb(id) { return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`; }
function thumbFb(id) { return `https://img.youtube.com/vi/${id}/hqdefault.jpg`; }

function renderGrid() {
  const grid = document.getElementById('catalog-grid');
  const list = currentCat === 'todos' ? videos : videos.filter(v => v.cat === currentCat);
  document.getElementById('count-label').textContent = `${list.length} produção${list.length !== 1 ? 'ões' : ''}`;

  if (!list.length) {
    grid.innerHTML = '<div class="empty-state" style="display:block;"><p>Nenhuma produção nessa categoria ainda.</p></div>';
    return;
  }

  grid.innerHTML = list.map((v, i) => `
    <div class="video-card" onclick="openLb('${v.id}','${v.title}')">
      <div class="card-thumb">
        <img src="${thumb(v.id)}" onerror="this.src='${thumbFb(v.id)}'" alt="${v.title}" loading="lazy">
        <div class="card-duration">${v.dur || ''}</div>
        <div class="play-btn">
          <svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="30"/><polygon points="23,18 45,30 23,42"/></svg>
        </div>
      </div>
      <div class="card-info">
        <span class="card-tag">${v.cat}</span>
        <div class="card-title">${v.title}</div>
        ${v.artist ? `<div class="card-desc" style="color:rgba(255,255,255,0.6);font-size:0.72rem;margin-bottom:0.3rem;">${v.artist}</div>` : ''}
        ${v.desc ? `<div class="card-desc">${v.desc}</div>` : ''}
      </div>
    </div>
  `).join('');
}

function filter(btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentCat = btn.dataset.cat;
  renderGrid();
}

function openLb(id, title) {
  document.getElementById('lb-frame').src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
  document.getElementById('lb-label').textContent = title;
  document.getElementById('lightbox').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeLb(e) {
  if (e && e.target !== document.getElementById('lightbox') && !e.target.classList.contains('lb-close')) return;
  document.getElementById('lightbox').classList.remove('active');
  document.getElementById('lb-frame').src = '';
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb({ target: document.getElementById('lightbox') }); });

// EDIT PANEL
function toggleEdit() {
  const p = document.getElementById('edit-panel');
  p.classList.toggle('active');
  if (p.classList.contains('active')) renderEditItems();
}

function renderEditItems() {
  const wrap = document.getElementById('ep-items');
  wrap.innerHTML = videos.map((v, i) => `
    <div class="ep-item" id="ep-item-${i}">
      <button class="ep-remove" onclick="removeItem(${i})" title="Remover">✕</button>
      <div class="ep-row">
        <div><label class="ep-label">Título</label><input class="ep-input" id="et${i}" value="${v.title}"></div>
        <div><label class="ep-label">Artista</label><input class="ep-input" id="ea${i}" value="${v.artist||''}"></div>
      </div>
      <div class="ep-row">
        <div><label class="ep-label">ID YouTube</label><input class="ep-input" id="ei${i}" value="${v.id}"></div>
        <div><label class="ep-label">Duração (ex: 3:42)</label><input class="ep-input" id="ed${i}" value="${v.dur||''}"></div>
      </div>
      <div class="ep-row">
        <div><label class="ep-label">Categoria</label>
          <select class="ep-input" id="ec${i}">
            ${CATS.map(c=>`<option value="${c}" ${v.cat===c?'selected':''}>${c}</option>`).join('')}
          </select>
        </div>
        <div><label class="ep-label">Descrição curta</label><input class="ep-input" id="edc${i}" value="${v.desc||''}"></div>
      </div>
      <hr style="border:none;border-top:1px solid var(--border);margin:0.75rem 0">
    </div>
  `).join('');
}

function addItem() {
  videos.push({ id: '', title: 'NOVO PROJETO', artist: '', cat: 'Clipe musical', dur: '', desc: '' });
  renderEditItems();
  document.getElementById(`ep-item-${videos.length-1}`).scrollIntoView({ behavior: 'smooth' });
}

function removeItem(i) {
  if (!confirm('Remover esta produção?')) return;
  videos.splice(i, 1);
  renderEditItems();
}

function saveAll() {
  videos = videos.map((_, i) => ({
    title: document.getElementById(`et${i}`)?.value?.trim() || videos[i].title,
    artist: document.getElementById(`ea${i}`)?.value?.trim() || '',
    id: document.getElementById(`ei${i}`)?.value?.trim() || videos[i].id,
    dur: document.getElementById(`ed${i}`)?.value?.trim() || '',
    cat: document.getElementById(`ec${i}`)?.value || videos[i].cat,
    desc: document.getElementById(`edc${i}`)?.value?.trim() || '',
  }));
  localStorage.setItem('inv_cat', JSON.stringify(videos));
  renderGrid();
  toggleEdit();
}

renderGrid();
