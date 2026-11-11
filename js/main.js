(()=>{
'use strict';
/* CONFIGURACIÓN: número de WhatsApp Business con indicativo de país, sin + ni espacios (ej. '573001234567').
   Pendiente: DIVINE es ficticia y no tiene un número real. Mientras esté vacío, los botones muestran el mensaje preparado. */
const WA_NUMBER='';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const cop=n=>'$'+n.toLocaleString('es-CO');
const calm=matchMedia('(prefers-reduced-motion:reduce)').matches;

const toastEl=$('#toast');let tt;
function toast(m){toastEl.textContent=m;toastEl.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>toastEl.classList.remove('show'),9000)}
function wa(msg){
  if(!WA_NUMBER){toast('Falta configurar el número de WhatsApp (WA_NUMBER en js/main.js). Mensaje preparado: “'+msg+'”');return}
  window.open('https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(msg),'_blank','noopener');
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-wa]');if(b)wa(b.dataset.wa)});

/* Menú */
const nav=$('#nav'),burger=$('.burger'),top=$('.top'),up=$('.up');
const setMenu=o=>{nav.classList.toggle('open',o);burger.setAttribute('aria-expanded',o);burger.setAttribute('aria-label',o?'Cerrar menú':'Abrir menú');document.body.style.overflow=o?'hidden':''};
burger.addEventListener('click',()=>setMenu(!nav.classList.contains('open')));
nav.addEventListener('click',e=>{if(e.target.matches('a'))setMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
addEventListener('scroll',()=>{top.classList.toggle('sc',scrollY>10);up.classList.toggle('show',scrollY>700)},{passive:true});
up.addEventListener('click',()=>scrollTo({top:0,behavior:calm?'auto':'smooth'}));

/* Contadores */
const co=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;co.unobserve(e.target);
  const el=e.target,end=+el.dataset.count,m=el.hasAttribute('data-money'),f=v=>m?cop(v):v;
  if(calm)return;
  const t0=performance.now();(function s(t){const k=Math.min((t-t0)/1100,1);el.textContent=f(Math.round(end*(1-Math.pow(1-k,3))));if(k<1)requestAnimationFrame(s)})(t0);
}),{threshold:.6});
$$('[data-count]').forEach(el=>co.observe(el));

/* Catálogo oficial del brief (editar aquí) */
const P=[
{n:'Le Male',b:'Jean Paul Gaultier',m:'125 ml',c:'Eau de Parfum / Toilette',f:'fresco',t:'Fresco / Oriental',p:570000,i:'assets/images/jpg-le-male.jpg'},
{n:'Sauvage',b:'Dior',m:'100 ml',c:'Eau de Parfum',f:'amaderado',t:'Amaderado / Cítrico',p:720000,i:'assets/images/dior-sauvage.jpg'},
{n:'Hawas Ice for Him',b:'Rasasi',m:'100 ml',c:'Eau de Parfum',f:'acuatico',t:'Acuático / Frutal',p:253990,i:'assets/images/rasasi-hawas-ice-for-him.jpg'},
{n:'1 Million',b:'Paco Rabanne',m:'100 ml',c:'Eau de Toilette',f:'especiado',t:'Especiado / Cuero',p:556500,i:'assets/images/paco-rabanne-1-million.jpg'},
{n:'Uomo Born in Roma',b:'Valentino',m:'100 ml',c:'Eau de Parfum Intense',f:'amaderado',t:'Amaderado / Ámbar',p:789900,i:'assets/images/valentino-uomo-born-in-roma.jpg'},
{n:'Luna Rossa Carbon',b:'Prada',m:'100 ml',c:'Eau de Toilette',f:'fougere',t:'Fougère / Mineral',p:459990,i:'assets/images/prada-luna-rossa-carbon.jpg'},
{n:'Le Beau Le Parfum',b:'Jean Paul Gaultier',m:'125 ml',c:'Eau de Parfum Intense',f:'amaderado',t:'Amaderado / Coco',p:618500,i:'assets/images/jpg-le-beau-le-parfum.jpg'}];
const grid=$('#grid');
grid.innerHTML=P.map((p,k)=>`<article class="tile" data-f="${p.f}" data-k="${k}" data-p="${p.p}"><div class="pic"><img src="${p.i}" alt="Frasco de ${p.b} ${p.n}" width="400" height="400" loading="lazy"></div><span class="star">${p.t}</span><h3>${p.n}</h3><p class="meta">${p.b}</p><p>${p.m}, ${p.c}</p><p class="price">${cop(p.p)} <small>COP</small></p><button class="btn" data-wa="Hola DIVINE, quiero consultar por ${p.b} ${p.n} (${p.m}, ${p.c}), precio sugerido ${cop(p.p)}.">Consultar / pedir por WhatsApp</button></article>`).join('');
const filt=f=>{$$('.chip').forEach(x=>x.setAttribute('aria-pressed',x.dataset.f===f));$$('.tile',grid).forEach(c=>c.hidden=f!=='todos'&&c.dataset.f!==f)};
$$('.chip').forEach(b=>b.addEventListener('click',()=>filt(b.dataset.f)));
$('#sort').addEventListener('change',e=>{const v=e.target.value;$$('.tile',grid).sort((a,b)=>v==='asc'?a.dataset.p-b.dataset.p:v==='desc'?b.dataset.p-a.dataset.p:a.dataset.k-b.dataset.k).forEach(x=>grid.append(x))});
$$('[data-fam]').forEach(b=>b.addEventListener('click',()=>{filt(b.dataset.fam);$('#coleccion').scrollIntoView({behavior:calm?'auto':'smooth'})}));

/* Guía “Encuentra tu aroma” */
const S=[
{k:'f',q:'¿Qué familia olfativa te atrae más?',o:['Fresco','Amaderado','Acuático','Especiado','Fougère','No lo sé']},
{k:'b',q:'¿Cuál es tu presupuesto?',o:['Hasta $500.000','$500.000 a $700.000','Más de $700.000']}];
const R=[[0,500000],[500000,700000],[700000,1e9]];
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const A={};let i=0,started=false;const quiz=$('#quiz');
function show(){
  if(i>=S.length)return result();
  const s=S[i];
  quiz.innerHTML=`<div class="prog" role="progressbar" aria-label="Progreso de la guía" aria-valuemin="0" aria-valuemax="${S.length}" aria-valuenow="${i}"><i style="width:${i/S.length*100}%"></i></div><p class="step">Pregunta ${i+1} de ${S.length}</p><h3 tabindex="-1">${s.q}</h3><div class="opts">${s.o.map(o=>`<button class="opt" aria-pressed="${A[s.k]===o}">${o}</button>`).join('')}</div>${i?'<button class="btn ghost back">Anterior</button>':''}`;
  $$('.opt',quiz).forEach(b=>b.onclick=()=>{A[s.k]=b.textContent;i++;started=true;show()});
  const bk=$('.back',quiz);if(bk)bk.onclick=()=>{i--;show()};
  if(started)$('h3',quiz).focus({preventScroll:true});
}
function result(){
  const [lo,hi]=R[S[1].o.indexOf(A.b)],fk=norm(A.f),any=fk==='no lo se';
  const dist=p=>p.p<lo?lo-p.p:p.p>hi?p.p-hi:0;
  const sc=p=>(any||p.f===fk?0:1e7)+dist(p);
  const r=[...P].sort((a,b)=>sc(a)-sc(b)||a.p-b.p),m=r[0],alt=r[1];
  const note=dist(m)?'Está algo fuera de tu presupuesto, pero es la más cercana a lo que buscas.':'Encaja con tu familia olfativa y tu presupuesto.';
  const msg=`Hola DIVINE, hice la guía “Encuentra tu aroma” (familia: ${A.f}, presupuesto: ${A.b}). Me recomendaron ${m.b} ${m.n}. ¿Me asesoran?`;
  quiz.innerHTML=`<div class="prog"><i style="width:100%"></i></div><p class="step">Tu recomendación</p><div class="rec"><img src="${m.i}" alt="Frasco de ${m.b} ${m.n}" width="104" height="104"><div><h3 tabindex="-1">${m.b} ${m.n}</h3><p class="meta">${m.t}. ${m.m}, ${m.c}.</p><p class="price">${cop(m.p)} <small>COP</small></p></div></div><p>${note}</p><p class="meta">Otra opción cercana: ${alt.b} ${alt.n}, ${cop(alt.p)} COP.</p><div class="cta"><button class="btn" data-wa="${msg}">Recibir asesoría por WhatsApp</button><button class="btn ghost" id="redo">Empezar de nuevo</button></div>`;
  $('#redo').onclick=()=>{i=0;show()};
  $('h3',quiz).focus({preventScroll:true});
}
show();

/* Preguntas frecuentes: una abierta a la vez */
$$('details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)$$('details').forEach(o=>{if(o!==d)o.open=false})}));

/* Formulario: valida y continúa por WhatsApp (sin backend, no simula envíos) */
const form=$('#form');
const rules={nombre:v=>v.trim().length>=2||'Escribe tu nombre.',mensaje:v=>v.trim().length>=10||'Cuéntanos un poco más: mínimo 10 caracteres.'};
form.addEventListener('submit',e=>{
  e.preventDefault();let ok=true;
  for(const k in rules){
    const f=form.elements[k],r=rules[k](f.value),bad=r!==true;
    f.setAttribute('aria-invalid',bad);$('#e-'+k).textContent=bad?r:'';
    if(bad&&ok){f.focus();ok=false}
  }
  if(ok)wa(`Hola DIVINE, soy ${form.elements.nombre.value.trim()}. Me interesa: ${form.elements.interes.value}. ${form.elements.mensaje.value.trim()}`);
});
})();
