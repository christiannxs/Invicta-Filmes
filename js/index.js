const DEFAULTS = [
  { id:'dQw4w9WgXcQ', title:'PROJETO 01', tag:'Clipe musical' },
  { id:'dQw4w9WgXcQ', title:'PROJETO 02', tag:'Institucional' },
  { id:'dQw4w9WgXcQ', title:'PROJETO 03', tag:'Documentário' },
  { id:'dQw4w9WgXcQ', title:'PROJETO 04', tag:'Publicitário' },
  { id:'dQw4w9WgXcQ', title:'PROJETO 05', tag:'Clipe musical' },
  { id:'dQw4w9WgXcQ', title:'PROJETO 06', tag:'Social media' },
  { id:'dQw4w9WgXcQ', title:'PROJETO 07', tag:'Institucional' },
  { id:'dQw4w9WgXcQ', title:'PROJETO 08', tag:'Publicitário' },
];

const CLIENTS = [
  'Marca A','Artista B','Empresa C','Marca D','Artista E',
  'Empresa F','Marca G','Artista H','Empresa I','Marca J',
  'Artista K','Empresa L','Marca M','Artista N',
];

const MARQUEE_ITEMS = ['Clipes','Documentários','Campanhas','Conteúdo','DVDs','Institucional','Social Media','Motion'];

let videos = JSON.parse(localStorage.getItem('inv_vids') || 'null') || DEFAULTS;

// Marquee
(function(){
  const track = document.getElementById('mtrack');
  const all = [...MARQUEE_ITEMS,...MARQUEE_ITEMS,...MARQUEE_ITEMS,...MARQUEE_ITEMS];
  track.innerHTML = all.map(t=>`<span class="marquee-item">${t}<span>✦</span></span>`).join('');
})();

// Clients
(function(){
  const g = document.getElementById('clients-grid');
  g.innerHTML = CLIENTS.map(c=>`<div class="client-pill">${c}</div>`).join('');
})();

function thumb(id){ return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`; }

function renderMosaic(){
  const g = document.getElementById('mosaic-grid');
  g.innerHTML = '';
  videos.forEach((v,i)=>{
    const el = document.createElement('div');
    el.className = 'mosaic-item';
    el.innerHTML = `
      <span class="mosaic-num">0${i+1}</span>
      <img class="mosaic-thumb" src="${thumb(v.id)}"
           onerror="this.src='https://img.youtube.com/vi/${v.id}/hqdefault.jpg'"
           alt="${v.title}" loading="lazy">
      <div class="mosaic-overlay">
        <div class="mosaic-tag">${v.tag}</div>
        <div class="mosaic-title">${v.title}</div>
      </div>
      <div class="mosaic-play">
        <svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
      </div>`;
    el.addEventListener('click',()=>openLb(v.id,v.title));
    g.appendChild(el);
  });
}

function openLb(id, title){
  document.getElementById('lb-frame').src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
  document.getElementById('lb-label').textContent = title;
  document.getElementById('lightbox').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeLb(e){
  if(e && e.target !== document.getElementById('lightbox') && !e.target.classList.contains('lb-close')) return;
  document.getElementById('lightbox').classList.remove('active');
  document.getElementById('lb-frame').src = '';
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeLb({target:document.getElementById('lightbox')}); });

function toggleEdit(){
  const p = document.getElementById('edit-panel');
  p.classList.toggle('active');
  if(p.classList.contains('active')) renderEditFields();
}

function renderEditFields(){
  document.getElementById('edit-fields').innerHTML = videos.map((v,i)=>`
    <div class="edit-row"><label>Projeto ${i+1} — título</label>
      <input id="vt${i}" value="${v.title}"></div>
    <div class="edit-row"><label>ID do YouTube</label>
      <input id="vi${i}" value="${v.id}" placeholder="ex: dQw4w9WgXcQ"></div>
    <div class="edit-row"><label>Categoria</label>
      <input id="vc${i}" value="${v.tag}"></div>
    ${i<videos.length-1?'<hr class="edit-divider">':''}
  `).join('');
}

function saveVideos(){
  videos = videos.map((_,i)=>({
    title: document.getElementById(`vt${i}`).value.trim() || videos[i].title,
    id:    document.getElementById(`vi${i}`).value.trim() || videos[i].id,
    tag:   document.getElementById(`vc${i}`).value.trim() || videos[i].tag,
  }));
  localStorage.setItem('inv_vids', JSON.stringify(videos));
  renderMosaic();
  toggleEdit();
}

renderMosaic();
