(() => {
  const hero=document.querySelector('.studio-hero');
  const stage=document.querySelector('.studio-stage');
  if(!hero||!stage)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer=window.matchMedia('(hover:hover) and (pointer:fine)');
  hero.querySelectorAll('.reel-strip').forEach(strip=>{
    const original=strip.querySelector('.reel-set');
    strip.append(original.cloneNode(true),original.cloneNode(true));
  });
  const backgroundVideos=[...hero.querySelectorAll('.studio-reels video')];
  backgroundVideos.forEach(video=>{video.muted=true;video.defaultMuted=true;});
  const visibleVideos=new Set();
  let heroVisible=true;
  function syncBackground(){
    const stopped=reduced.matches||document.hidden||!heroVisible;
    hero.classList.toggle('is-background-paused',stopped);
    backgroundVideos.forEach(video=>{
      if(stopped||!visibleVideos.has(video)){video.pause();}
      else if(video.paused){const pending=video.play();if(pending)pending.catch(()=>{});}
    });
  }
  const videoObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting)visibleVideos.add(entry.target);else visibleVideos.delete(entry.target);});
    syncBackground();
  },{root:hero,threshold:0.02});
  backgroundVideos.forEach(video=>videoObserver.observe(video));
  const heroObserver=new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;syncBackground();},{threshold:0.01});
  heroObserver.observe(hero);
  document.addEventListener('visibilitychange',syncBackground);
  reduced.addEventListener('change',syncBackground);
  syncBackground();
  function enter(){
    hero.classList.remove('is-entering');
    if(reduced.matches) return;
    void hero.offsetWidth;
    hero.classList.add('is-entering');
    window.setTimeout(()=>{hero.classList.remove('is-entering');},2200);
  }
  let frame=0,tx=0,ty=0,x=0,y=0;
  function ease(){
    x+=(tx-x)*.09;y+=(ty-y)*.09;
    stage.style.setProperty('--px',x.toFixed(2)+'px');
    stage.style.setProperty('--py',y.toFixed(2)+'px');
    if(Math.abs(tx-x)+Math.abs(ty-y)>.06){frame=requestAnimationFrame(ease);}else{frame=0;}
  }
  function track(event){
    if(reduced.matches||!finePointer.matches)return;
    const box=hero.getBoundingClientRect();
    tx=((event.clientX-box.left)/box.width-.5)*12;
    ty=((event.clientY-box.top)/box.height-.5)*8;
    if(!frame)frame=requestAnimationFrame(ease);
  }
  hero.addEventListener('pointermove',track,{passive:true});
  hero.addEventListener('pointerleave',()=>{tx=ty=0;if(!frame&&!reduced.matches)frame=requestAnimationFrame(ease);},{passive:true});
  reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;tx=ty=x=y=0;stage.style.setProperty('--px','0px');stage.style.setProperty('--py','0px');hero.classList.remove('is-entering');});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}});
  enter();
})();
