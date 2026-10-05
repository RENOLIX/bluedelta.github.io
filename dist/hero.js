const slides=[...document.querySelectorAll('.hero-slide')];
const buttons=[...document.querySelectorAll('.hero-dot')];
if(slides.length>1){
  let current=0,timer;
  const mobile=window.matchMedia('(max-width:760px)').matches;
  const names=['hero-day','hero-trucks-day','hero-btp-day'];
  const ready=[];
  function prepare(index){return ready[index]||=(async()=>{const photo=new Image();photo.src='/assets/'+names[index]+(mobile?'-mobile':'')+'.webp';await photo.decode();if(index)slides[index].style.backgroundImage=`url("${photo.src}")`})().catch(()=>{})}
  async function show(index){const next=(index+slides.length)%slides.length;await prepare(next);current=next;slides.forEach((slide,i)=>{slide.classList.toggle('active',i===current);slide.setAttribute('aria-hidden',i===current?'false':'true')});buttons.forEach((button,i)=>{button.classList.toggle('active',i===current);button.setAttribute('aria-pressed',i===current?'true':'false')})}
  const stop=()=>clearInterval(timer);
  const start=()=>{stop();if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)timer=setInterval(()=>show(current+1),2000)};
  buttons.forEach((button,i)=>button.addEventListener('click',()=>{show(i);start()}));
  document.querySelector('.hero').addEventListener('mouseenter',stop);
  document.querySelector('.hero').addEventListener('mouseleave',start);
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
  prepare(0).then(()=>{start();prepare(1).then(()=>prepare(2))});
}
