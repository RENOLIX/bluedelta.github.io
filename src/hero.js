const slides=[...document.querySelectorAll('.hero-slide')];
const buttons=[...document.querySelectorAll('.hero-dot')];
if(slides.length>1){
  let current=0,timer;
  function show(index){current=(index+slides.length)%slides.length;slides.forEach((slide,i)=>{slide.classList.toggle('active',i===current);slide.setAttribute('aria-hidden',i===current?'false':'true')});buttons.forEach((button,i)=>{button.classList.toggle('active',i===current);button.setAttribute('aria-pressed',i===current?'true':'false')})}
  const stop=()=>clearInterval(timer);
  const start=()=>{stop();if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)timer=setInterval(()=>show(current+1),2000)};
  buttons.forEach((button,i)=>button.addEventListener('click',()=>{show(i);start()}));
  document.querySelector('.hero').addEventListener('mouseenter',stop);
  document.querySelector('.hero').addEventListener('mouseleave',start);
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
  start();
}
