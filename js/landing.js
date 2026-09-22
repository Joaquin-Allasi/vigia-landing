/* VIGIA LANDING engine — sin CDN, CSP-safe (script-src 'self'). */
(function(){
"use strict";
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};

/* Reveal on scroll */
try{
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
  $$('.rv').forEach(function(el){io.observe(el)});
}catch(e){$$('.rv').forEach(function(el){el.classList.add('in')})}

/* Slider antes/después */
(function(){
  var box=$('#splitSlider'); if(!box) return;
  var before=$('#splitBefore'), handle=$('#splitHandle');
  var drag=false;
  function set(clientX){
    var r=box.getBoundingClientRect(), p=(clientX-r.left)/r.width;
    p=Math.max(.05,Math.min(.95,p)); var pct=(p*100).toFixed(1)+'%';
    before.style.width=pct; handle.style.left=pct;
  }
  box.addEventListener('mousedown',function(e){drag=true;set(e.clientX)});
  window.addEventListener('mouseup',function(){drag=false});
  window.addEventListener('mousemove',function(e){if(drag)set(e.clientX)});
  box.addEventListener('touchstart',function(e){drag=true;set(e.touches[0].clientX)},{passive:true});
  window.addEventListener('touchend',function(){drag=false});
  window.addEventListener('touchmove',function(e){if(drag)set(e.touches[0].clientX)},{passive:true});
})();

/* Simulador human-in-the-loop */
var CASOS={
 1:{img:'assets/muestra_calle_1.jpg',titulo:'Posible Gresca / Riña Callejera',desc:'2 personas en contacto acelerado con agitación sostenida 1.8s. ByteTrack + RF-DETR Medium.',box:{top:'32%',left:'28%',width:'38%',height:'50%'},tag:'POSIBLE GRESCA 94%',detail:'RF-DETR: 2 personas · 78ms',cam:'CAM-001 · Av. Riva Agüero cdra. 5',uni:'Patrullero M-01 (Sector 1)',eta:'ETA: 1m 40s',ruta:'Vía óptima: Av. César Vallejo × Jr. Áncash'},
 2:{img:'assets/muestra_calle_2.jpg',titulo:'Descarga Comercial (Falso Positivo)',desc:'Camión detenido con bultos estáticos en horario comercial. Actividad regular de abastecimiento.',box:{top:'40%',left:'35%',width:'32%',height:'42%'},tag:'POSIBLE DESMONTE 68%',detail:'2ª etapa: pendiente confirmación',cam:'CAM-008 · Mercado Nicolás Ayllón',uni:'Moto MOTO-02 (Sector 4)',eta:'ETA: 2m 10s',ruta:'Vía óptima: Prolong. Riva Agüero'},
 3:{img:'assets/muestra_calle_4.jpg',titulo:'Persona Caída en Calzada',desc:'Colapso vertical brusco + inmovilidad >3s. Prioridad crítica, auxilio médico.',box:{top:'48%',left:'42%',width:'28%',height:'36%'},tag:'PERSONA EN SUELO 98%',detail:'Crítica · auxilio requerido',cam:'CAM-003 · Av. J.C. Mariátegui cdra. 6',uni:'Ambulancia AMB-01 (Sector 1)',eta:'ETA: 2m 45s',ruta:'Corredor rápido: Mariátegui directo'}
};
var actual=1;
window.cargarCasoSimulador=function(n){
  actual=n; var c=CASOS[n]; if(!c) return;
  $('#simImg').src=c.img; $('#simTitulo').textContent=c.titulo; $('#simDesc').textContent=c.desc;
  $('#simCam').textContent=c.cam; $('#simUni').textContent=c.uni; $('#simEta').textContent=c.eta; $('#simRuta').textContent=c.ruta;
  var b=$('#simBox'); b.style.top=c.box.top; b.style.left=c.box.left; b.style.width=c.box.width; b.style.height=c.box.height;
  $('#simTag').textContent=c.tag; $('#simDetail').textContent=c.detail;
  var fb=$('#fb'); if(fb) fb.style.display='none';
  for(var i=1;i<=3;i++){var btn=$('#btnCaso'+i); if(btn) btn.className=i===n?'on':'';}
};
window.ejecutarDecision=function(tipo){
  var c=CASOS[actual], fb=$('#fb'); if(!fb||!c) return; fb.style.display='block';
  fb.innerHTML=tipo==='validar'
   ?'<div style="color:#10B981;font-weight:800;margin-bottom:6px">✓ VALIDADO → DESPACHADO</div><div>NUEVO → VALIDADO → DESPACHADO. <b style="color:#fff">'+c.uni+'</b> en ruta ('+c.eta+'). Firma de operador en bitácora.</div>'
   :'<div style="color:#FFB020;font-weight:800;margin-bottom:6px">⚡ DESCARTADO · AUTO-APRENDIZAJE</div><div>Enviado como NORMAL. 57 rasgos calibrados en 1.2s en este equipo. Sin costo nube.</div>';
};
$$('[data-caso]').forEach(function(b){b.addEventListener('click',function(){window.cargarCasoSimulador(+b.getAttribute('data-caso'))})});
$$('[data-decide]').forEach(function(b){b.addEventListener('click',function(){window.ejecutarDecision(b.getAttribute('data-decide'))})});

/* Mapa Leaflet local con fallback */
var mapa=null; var CENTRO=[-12.0453,-76.9928];
function pintarMapa(){
  if(mapa) return;
  if(!window.L){$('#mapaAgustino').innerHTML='<div style="padding:40px;font-family:monospace;color:#94A3B8">Mapa offline: vendor/leaflet.js no cargado. Use Proximamente teselas locales.</div>';return}
  mapa=L.map('mapaAgustino',{center:CENTRO,zoom:14,zoomControl:false,attributionControl:false});
  var tiles=L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png',{maxZoom:19});
  tiles.on('tileerror',function(){/* fallback táctico: sigue con vector propio */});
  tiles.addTo(mapa);
  var sectores=[
   {n:'SECTOR 1 · CENTRO',c:'#38BDF8',p:[[-12.0400,-76.9990],[-12.0392,-76.9895],[-12.0455,-76.9862],[-12.0498,-76.9915],[-12.0470,-76.9998]]},
   {n:'SECTOR 2 · RIBERA',c:'#22D3EE',p:[[-12.0318,-77.0060],[-12.0300,-76.9905],[-12.0392,-76.9895],[-12.0400,-76.9990],[-12.0362,-77.0058]]},
   {n:'SECTOR 3 · ESTE',c:'#A78BFA',p:[[-12.0392,-76.9895],[-12.0330,-76.9790],[-12.0430,-76.9755],[-12.0505,-76.9840],[-12.0455,-76.9862]]},
   {n:'SECTOR 4 · SUR',c:'#F59E0B',p:[[-12.0498,-76.9915],[-12.0505,-76.9840],[-12.0580,-76.9855],[-12.0602,-76.9960],[-12.0530,-76.9985]]},
   {n:'SECTOR 5 · OESTE',c:'#F472B6',p:[[-12.0400,-76.9990],[-12.0470,-76.9998],[-12.0530,-76.9985],[-12.0545,-77.0075],[-12.0430,-77.0080],[-12.0362,-77.0058]]}
  ];
  sectores.forEach(function(s){L.polygon(s.p,{color:s.c,weight:1.5,fillColor:s.c,fillOpacity:.1,dashArray:'4,4'}).bindTooltip(s.n).addTo(mapa)});
  [['CAM-001',-12.0432,-76.9968,'Riva Agüero'],['CAM-003',-12.0455,-76.9910,'Mariátegui 6'],['CAM-006',-12.0402,-76.9852,'Ancieta 4'],['CAM-008',-12.0522,-76.9990,'N. Ayllón 8'],['CAM-010',-12.0462,-77.0018,'Santa Rosa 9']].forEach(function(c){
    L.circleMarker([c[1],c[2]],{radius:6,fillColor:'#E67E52',color:'#fff',weight:1.5,fillOpacity:.95}).bindTooltip('<b>'+c[0]+'</b><br>'+c[3]).addTo(mapa)});
  L.circleMarker([-12.0418,-76.9955],{radius:7,fillColor:'#10B981',color:'#fff',weight:2,fillOpacity:1}).bindTooltip('<b>M-01</b> DISPONIBLE').addTo(mapa);
  L.circleMarker([-12.0438,-76.9972],{radius:5.5,fillColor:'#F59E0B',color:'#fff',weight:1.5,fillOpacity:1}).bindTooltip('<b>SER-014</b> Riva Agüero').addTo(mapa);
}
window.centrarMapa=function(){if(mapa)mapa.setView(CENTRO,14);else pintarMapa()};
document.addEventListener('DOMContentLoaded',function(){
  try{pintarMapa()}catch(e){}
  // salud backend :8008
  var pill=$('#svcPill');
  function setPill(ok){if(!pill)return;pill.classList.toggle('ok',!!ok);pill.querySelector('span').textContent=ok?'Servicio :8008 EN LÍNEA':'Solo local · sin servicio (demo igual funciona)'}
  fetch('http://localhost:8008/salud',{cache:'no-store'}).then(function(){setPill(true)}).catch(function(){setPill(false)});
  setTimeout(function(){if(pill&&!pill.classList.contains('ok'))setPill(false)},2500);
});

/* Acceso: iframe lazy mismo origen + lite/full + progreso */
window.probarVigia=function(modo){
  var f=$('#frameVigia'), w=$('#frameWrap'), hint=$('#frameHint'), sk=$('#frameSkeleton');
  if(!f||!w) return;
  modo=(modo==='lite')?'lite':'full';
  var src='index.html?origen=landing'+(modo==='lite'?'&lite=1':'');
  try{
    if(modo==='lite'){localStorage.setItem('vigia:lite','1');}else{localStorage.removeItem('vigia:lite');}
    sessionStorage.setItem('vigia:modo',modo);
  }catch(e){}
  var pasos=['1/4 núcleo','2/4 interfaz','3/4 modelo '+(modo==='lite'?'COCO-SSD 18MB':'RF-DETR 116MB'),'4/4 cámara'];
  var i=0;
  if(hint)hint.textContent='Cargando consola ('+pasos[0]+')…';
  var tick=setInterval(function(){i++; if(i<pasos.length&&hint)hint.textContent='Cargando consola ('+pasos[i]+')… Permita la cámara cuando se pida.'},1200);
  if(sk)sk.textContent='Cargando '+(modo==='lite'?'LITE instantáneo':'FULL IA')+'… '+pasos.join(' → ');
  if(f.getAttribute('src')!==src)f.src=src;
  w.scrollIntoView({behavior:'smooth',block:'center'});
  f.addEventListener('load',function(){
    clearInterval(tick);
    if(sk)sk.style.display='none';
    f.style.minHeight='640px';
    if(hint)hint.textContent='Consola en vivo. D demo · S sismo · Ctrl+K · M audio.'+(modo==='lite'?' [LITE: pulse 🧠 IA Full para 116MB]':'');
  },{once:true});
};
window.abrirFullscreen=function(){var f=$('#frameVigia'); if(f&&f.requestFullscreen)f.requestFullscreen();};

/* Modal video — ruta local comprimida (assets/video), preload none, Range 206 */
window.abrirVideo=function(lang){
  var m=$('#videoModal'), v=$('#videoEl'), meta=$('#videoMeta'); if(!m||!v)return;
  v.poster='assets/calle_agustino.jpg'; v.preload='none';
  v.src='assets/video/explicador-ES.mp4';
  if(meta)meta.textContent='Video local ES · 34MB · streaming por rangos — si publicas, comprime a 720p ~8MB con ffmpeg';
  m.classList.add('open');
  try{v.load(); var pr=v.play(); if(pr&&pr.catch)pr.catch(function(){})}catch(e){}
};
window.cerrarVideo=function(){var m=$('#videoModal'),v=$('#videoEl');if(m)m.classList.remove('open');if(v){v.pause();v.removeAttribute('src');v.load();}};
document.addEventListener('keydown',function(e){if(e.key==='Escape')window.cerrarVideo()});

/* Wiring CSP-safe (sin onclick inline) */
document.addEventListener('DOMContentLoaded',function(){
  var b;
  b=$('#btnProbar'); if(b)b.addEventListener('click',function(){window.probarVigia('full')});
  b=$('#btnProbar2'); if(b)b.addEventListener('click',function(){window.probarVigia('full')});
  b=$('#btnLite'); if(b)b.addEventListener('click',function(){window.probarVigia('lite')});
  b=$('#btnFullIA'); if(b)b.addEventListener('click',function(){window.probarVigia('full')});
  b=$('#btnFull'); if(b)b.addEventListener('click',window.abrirFullscreen);
  b=$('#btnFullSlider'); if(b)b.addEventListener('click',function(){var s=$('#splitSlider'); if(s&&s.requestFullscreen)s.requestFullscreen()});
  b=$('#btnCenter'); if(b)b.addEventListener('click',window.centrarMapa);
  b=$('#btnVideoES'); if(b)b.addEventListener('click',function(){window.abrirVideo('ES')});
  b=$('#videoClose'); if(b)b.addEventListener('click',window.cerrarVideo);
  b=$('#videoModal'); if(b)b.addEventListener('click',function(e){if(e.target===b)window.cerrarVideo()});
  b=$('#lightClose'); if(b)b.addEventListener('click',function(){$('#lightbox').classList.remove('open')});
  b=$('#lightbox'); if(b)b.addEventListener('click',function(e){if(e.target===b)b.classList.remove('open')});
  // Galería calles -> simulador + slider
  Array.prototype.forEach.call(document.querySelectorAll('[data-calle]'),function(btn){
    btn.addEventListener('click',function(){
      var src=btn.getAttribute('data-calle');
      var sim=$('#simImg'); if(sim)sim.src=src;
      var before=$('#splitBefore img'); if(before)before.src=src;
    });
  });
  // Lightbox gráficas
  Array.prototype.forEach.call(document.querySelectorAll('[data-zoom]'),function(img){
    img.style.cursor='zoom-in';
    img.addEventListener('click',function(){
      var lb=$('#lightbox'), li=$('#lightImg');
      if(lb&&li){li.src=img.src; lb.classList.add('open');}
    });
  });
  // Contadores + progress top
  var counted=false;
  function counters(){
    if(counted)return; counted=true;
    Array.prototype.forEach.call(document.querySelectorAll('[data-count]'),function(el){
      var target=+el.getAttribute('data-count'), t0=performance.now();
      (function tick(t){var p=Math.min(1,(t-t0)/1200), v=Math.round(target*p); el.textContent=v; if(p<1)requestAnimationFrame(tick)})(t0);
    });
  }
  var io2=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)counters()})},{threshold:.3});
  var m=document.querySelector('.metrics'); if(m)io2.observe(m); else counters();
  window.addEventListener('scroll',function(){
    var h=document.documentElement, p=h.scrollTop/(h.scrollHeight-h.clientHeight||1);
    var bar=$('#progressTop'); if(bar)bar.style.width=(p*100)+'%';
  },{passive:true});
});
})();
