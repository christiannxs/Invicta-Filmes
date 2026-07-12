// Home — conteúdo carregado do Supabase, com fallback local se estiver offline.
const FALLBACK_VIDEOS = [
  { id:'lhCQxreLeAw', title:'PROJETO 01', tag:'Clipe musical' },
  { id:'mpiX5Szs-Xs', title:'PROJETO 02', tag:'DVD / Show' },
  { id:'XGpuOYFEHe4', title:'PROJETO 03', tag:'Clipe musical' },
  { id:'X82BOrgMeos', title:'PROJETO 04', tag:'Clipe musical' },
  { id:'-6J3HfX4sbg', title:'PROJETO 05', tag:'DVD / Show' },
  { id:'N62whNs7CqQ', title:'PROJETO 06', tag:'Clipe musical' },
  { id:'P_kzO3v7ixY', title:'PROJETO 07', tag:'Documentário' },
  { id:'h_2Gk89is-o', title:'PROJETO 08', tag:'Clipe musical' },
];
const FALLBACK_CLIENTS = [
  'Marca A','Artista B','Empresa C','Marca D','Artista E',
  'Empresa F','Marca G','Artista H','Empresa I','Marca J',
  'Artista K','Empresa L','Marca M','Artista N',
];
const MARQUEE_ITEMS = ['Clipes','Documentários','Campanhas','Conteúdo','DVDs','Institucional','Social Media','Motion'];

// Marquee (esc vem de supabase-config.js)
function renderMarquee(items){
  const track = document.getElementById('mtrack');
  const all = [...items,...items,...items,...items];
  track.innerHTML = all.map(t=>`<span class="marquee-item">${esc(t)}<span>✦</span></span>`).join('');
}
renderMarquee(MARQUEE_ITEMS);

function thumb(id){ return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`; }

function renderMosaic(videos){
  const g = document.getElementById('mosaic-grid');
  g.innerHTML = '';
  videos.slice(0,8).forEach((v,i)=>{
    const el = document.createElement('div');
    el.className = 'mosaic-item';
    el.tabIndex = 0;
    el.setAttribute('role','button');
    el.setAttribute('aria-label',`Assistir ${v.title}`);
    el.innerHTML = `
      <span class="mosaic-num">0${i+1}</span>
      <img class="mosaic-thumb" src="${thumb(v.id)}"
           onerror="this.src='https://img.youtube.com/vi/${v.id}/hqdefault.jpg'"
           alt="${esc(v.title)}" loading="lazy">
      <div class="mosaic-overlay">
        <div class="mosaic-tag">${esc(v.tag)}</div>
        <div class="mosaic-title">${esc(v.title)}</div>
      </div>
      <div class="mosaic-play">
        <svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="5,3 19,12 5,21"/></svg>
      </div>`;
    const open = ()=>openLb(v.id,v.title);
    el.addEventListener('click',open);
    el.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){ e.preventDefault(); open(); }
    });
    g.appendChild(el);
  });
}

function renderClients(names){
  const g = document.getElementById('clients-grid');
  g.innerHTML = names.map(c=>`<div class="client-pill">${esc(c)}</div>`).join('');
}

function renderServices(list){
  if (!Array.isArray(list) || !list.length) return;
  document.getElementById('services-cards').innerHTML = list.map(sv=>`
    <div class="service-card">
      <div class="service-icon">${esc(sv.icon || '◈')}</div>
      <div class="service-name">${esc(sv.name || '')}</div>
      <ul class="service-items">${(sv.items || []).map(i=>`<li>${esc(i)}</li>`).join('')}</ul>
    </div>`).join('');
}

// Visual do hero: logo padrão, logo personalizada ou foto enviada no admin
function applyHeroMedia(s){
  const img = document.getElementById('hero-logo');
  const hm = s.hero_media || {};
  if (hm.type === 'image' && hm.url){
    img.src = hm.url;
    img.classList.add('hero-photo');
  } else if (typeof s.logo_url === 'string' && s.logo_url){
    img.src = s.logo_url;
  }
}

// Quadro visual da seção "Sobre": foto enviada no admin ou texto + marca d'água
function applyAboutVisual(s){
  const box = document.getElementById('about-visual');
  const am = s.about_media || {};
  if (am.type === 'image' && am.url){
    box.classList.add('has-photo');
    box.style.backgroundImage = `url("${String(am.url).replace(/"/g,'%22')}")`;
  }
  if (typeof s.about_watermark === 'string' && s.about_watermark){
    box.style.setProperty('--about-watermark', `'${s.about_watermark.replace(/'/g,'')}'`);
  }
}

function applySettings(s){
  applyBranding(s);   // cores, título da aba, favicon, logo da nav
  applyTexts(s);      // todos os elementos [data-s]
  applyHeroMedia(s);
  applyAboutVisual(s);
  renderServices(s.services);
  if (Array.isArray(s.marquee_items) && s.marquee_items.length) renderMarquee(s.marquee_items);
  if (Array.isArray(s.stats) && s.stats.length){
    document.getElementById('about-stats').innerHTML = s.stats.map(st=>
      `<div><div class="stat-num">${esc(st.num)}</div><div class="stat-lbl">${esc(st.label)}</div></div>`).join('');
  }
  if (s.contact_email)    document.getElementById('contact-email').href = `mailto:${s.contact_email}`;
  if (s.contact_whatsapp) document.getElementById('contact-whatsapp').href = `https://wa.me/${String(s.contact_whatsapp).replace(/\D/g,'')}`;
  if (s.contact_instagram)document.getElementById('contact-instagram').href = `https://instagram.com/${String(s.contact_instagram).replace(/^@/,'')}`;
}

// Carrega conteúdo do Supabase (fallback para constantes locais)
(async function init(){
  try {
    const [videos, clients, settings] = await Promise.all([
      sbFetch('videos?select=youtube_id,title,category&show_on_home=eq.true&order=sort_order.asc&limit=8'),
      sbFetch('clients?select=name&order=sort_order.asc'),
      sbFetch('site_settings?select=key,value'),
    ]);
    renderMosaic(videos.length
      ? videos.map(v=>({ id:v.youtube_id, title:v.title, tag:v.category }))
      : FALLBACK_VIDEOS);
    renderClients(clients.length ? clients.map(c=>c.name) : FALLBACK_CLIENTS);
    applySettings(Object.fromEntries(settings.map(r=>[r.key,r.value])));
  } catch (err) {
    renderMosaic(FALLBACK_VIDEOS);
    renderClients(FALLBACK_CLIENTS);
  }
})();

// Lightbox
function openLb(id, title){
  document.getElementById('lb-frame').src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
  document.getElementById('lb-label').textContent = title;
  document.getElementById('lightbox').classList.add('active');
  document.body.style.overflow = 'hidden';
  document.getElementById('lb-close').focus();
}
function closeLb(){
  document.getElementById('lightbox').classList.remove('active');
  document.getElementById('lb-frame').src = '';
  document.body.style.overflow = '';
}
document.getElementById('lb-close').addEventListener('click', closeLb);
document.getElementById('lightbox').addEventListener('click', e=>{
  if(e.target === document.getElementById('lightbox')) closeLb();
});
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeLb(); });

// Menu mobile
(function(){
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('mobile-menu');
  const setOpen = open=>{
    menu.classList.toggle('active', open);
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  toggle.addEventListener('click', ()=>setOpen(!menu.classList.contains('active')));
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>setOpen(false)));
})();

// Ano do rodapé
document.getElementById('year').textContent = new Date().getFullYear();
