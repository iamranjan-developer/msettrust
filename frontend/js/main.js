// MSET - interactions
document.addEventListener('DOMContentLoaded',()=>{
  const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
  const btn=document.getElementById('hamburger'); const links=document.getElementById('navLinks');
  if(btn&&links) btn.addEventListener('click',()=>links.classList.toggle('open'));
  // counters
  const counters=document.querySelectorAll('[data-count]');
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting) return; const el=e.target; io.unobserve(el);
    const target=+el.dataset.count; let cur=0; const step=Math.max(1,Math.round(target/80));
    const t=setInterval(()=>{cur+=step; if(cur>=target){cur=target;clearInterval(t)} el.textContent=cur.toLocaleString('en-IN')+(el.dataset.suffix||'')},20);
  }),{threshold:.4});
  counters.forEach(c=>io.observe(c));
  // forms fake submit
  document.querySelectorAll('form[data-demo]').forEach(f=>{
    f.addEventListener('submit',ev=>{ev.preventDefault();
      const msg=f.querySelector('.form-msg')||document.createElement('div');
      msg.className='alert form-msg'; msg.style.marginTop='1rem';
      msg.textContent='Thank you! Your request has been received. Our team will contact you within 24-48 hours. — Modern Skill Educational Trust';
      f.appendChild(msg); f.reset(); msg.scrollIntoView({behavior:'smooth',block:'center'});
    })
  });
  // gallery filter
  const filterBtns=document.querySelectorAll('[data-filter]');
  const items=document.querySelectorAll('[data-cat]');
  filterBtns.forEach(b=>b.addEventListener('click',()=>{
    filterBtns.forEach(x=>x.classList.remove('btn-dark')); b.classList.add('btn-dark');
    const v=b.dataset.filter;
    items.forEach(it=>{it.style.display=(v==='all'||it.dataset.cat===v)?'':'none'})
  }));
  // FAQ
  document.querySelectorAll('details').forEach(d=>{d.style.background='#fff';d.style.border='1px solid #e6edf5';d.style.borderRadius='12px';d.style.padding='1rem';d.style.marginBottom='.7rem'});
});
function donatePreset(v){const i=document.getElementById('amount'); if(i){i.value=v; i.focus(); document.getElementById('donate-form')?.scrollIntoView({behavior:'smooth'})}}
