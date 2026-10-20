/* motion.js — adds page motion. Safe: if anything fails the site still works normally. */
(function(){
  'use strict';
  var root=document.documentElement;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  root.classList.add('mo-on');
  var fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var small=window.matchMedia('(max-width:700px)').matches;
  var raf=window.requestAnimationFrame.bind(window);

  function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn()}

  ready(function(){
    try{ hero(); }catch(e){}
    try{ progress(); }catch(e){}
    try{ reveals(); }catch(e){}
    try{ band(); }catch(e){}
    try{ glow(); }catch(e){}
    try{ transitions(); }catch(e){}
    try{ floater(); }catch(e){}
  });

  /* ---------- hero: every word arrives its own way, whole sentence glows, then repeats ---------- */
  function splitWords(el){
    var words=[];
    (function walk(node){
      Array.prototype.slice.call(node.childNodes).forEach(function(n){
        if(n.nodeType===3){
          var frag=document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function(p){
            if(!p)return;
            if(/^\s+$/.test(p)){frag.appendChild(document.createTextNode(' '))}
            else{var s=document.createElement('span');s.className='mo-w';s.textContent=p;words.push(s);frag.appendChild(s)}
          });
          n.parentNode.replaceChild(frag,n);
        }else if(n.nodeType===1&&n.nodeName!=='BR'){walk(n)}
      });
    })(el);
    return words;
  }
  function hero(){
    var h1=document.querySelector('.hero h1'); if(!h1)return;
    var lines=[[]];
    Array.prototype.slice.call(h1.childNodes).forEach(function(n){
      if(n.nodeName==='BR'){lines.push([])}else if(n.nodeType===1||(n.textContent||'').trim()){lines[lines.length-1].push(n)}
    });
    lines=lines.filter(function(l){return l.length});
    if(lines.length){
      h1.innerHTML='';
      lines.forEach(function(group){
        var o=document.createElement('span');o.className='mo-line';
        group.forEach(function(n){o.appendChild(n)});h1.appendChild(o);
      });
    }
    var hw=splitWords(h1);
    hw.forEach(function(w,i){w.classList.add('mo-t'+(i%3));w.style.setProperty('--wd',(i*.45)+'s')});
    var halo=document.createElement('span');halo.className='mo-halo';halo.setAttribute('aria-hidden','true');h1.insertBefore(halo,h1.firstChild);
    var lead=document.querySelector('.hero-lead');
    if(lead){
      var lw=splitWords(lead),types=[4,5,0];
      lw.forEach(function(w,i){w.classList.add('mo-t'+types[i%3],'mo-s');w.style.setProperty('--wd',(.9+i*.11)+'s')});
    }
    ['.hero .eyebrow','.hero-actions'].forEach(function(sel,i){
      var el=document.querySelector(sel); if(!el)return;
      el.classList.add('mo-up'); el.style.setProperty('--mo-delay',(i===0?.1:1.2)+'s');
    });
    var hero=document.querySelector('.hero');
    var beam=document.createElement('div');beam.className='mo-beam';beam.setAttribute('aria-hidden','true');hero.appendChild(beam);
    /* Gold dust particles removed per BELTYX art direction; all other hero animations remain. */
  }

  /* ---------- drifting gold dust inside the hero ---------- */
  function dust(host){
    if(!host||!host.getContext&&!document.createElement('canvas').getContext)return;
    var c=document.createElement('canvas');c.className='mo-dust';host.appendChild(c);
    var ctx=c.getContext('2d'),dpr=Math.min(window.devicePixelRatio||1,2),W=0,H=0,ps=[],N=small?30:34,visible=true,run=true;
    function size(){W=host.clientWidth;H=host.clientHeight;c.width=W*dpr;c.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
    function mk(initial){return{x:Math.random()*W,y:initial?Math.random()*H:H+10,r:Math.random()*(small?2.3:1.6)+.5,s:Math.random()*.4+.14,a:Math.random()*.5+.2,p:Math.random()*6.28}}
    size();for(var i=0;i<N;i++)ps.push(mk(true));
    window.addEventListener('resize',size);
    if('IntersectionObserver' in window){new IntersectionObserver(function(e){visible=e[0].isIntersecting}).observe(host)}
    document.addEventListener('visibilitychange',function(){run=!document.hidden});
    (function tick(t){
      if(visible&&run){
        ctx.clearRect(0,0,W,H);
        for(var i=0;i<ps.length;i++){var p=ps[i];p.y-=p.s;p.x+=Math.sin(t/1800+p.p)*.18;
          if(p.y<-10){ps[i]=mk(false);continue}
          var f=Math.min(1,p.y/(H*.25),(H-p.y)/(H*.15)+.4);
          ctx.beginPath();ctx.fillStyle='rgba(224,190,120,'+((small?1.15:1)*p.a*Math.max(0,Math.min(1,f)))+')';ctx.arc(p.x,p.y,p.r,0,6.283);ctx.fill();}
      }
      raf(tick);
    })(0);
  }

  /* ---------- scroll progress line ---------- */
  function progress(){
    var b=document.createElement('div');b.className='mo-progress';document.body.appendChild(b);
    var tick=false,hv=document.querySelector('.hero-visual');
    function upd(){tick=false;if(hv)hv.style.setProperty('--py',Math.min(70,(window.pageYOffset||0)*.14)+'px');var h=document.documentElement.scrollHeight-window.innerHeight;b.style.transform='scaleX('+(h>0?Math.min(1,(window.pageYOffset||0)/h):0)+')'}
    window.addEventListener('scroll',function(){if(!tick){tick=true;raf(upd)}},{passive:true});upd();
  }

  /* ---------- staggered scroll reveals (also catches cards added later by the shop script) ---------- */
  function reveals(){
    if(!('IntersectionObserver' in window))return;
    var SEL='.product-card,.category-card,.section-head,.numbers>div,.footer-grid>div,.manifesto-copy h2,.order-card,.review-card,.contact-card,.story-copy>*';
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting)return;
        var el=e.target;io.unobserve(el);
        raf(function(){el.classList.add('mo-in');
          setTimeout(function(){el.classList.remove('mo-rev','mo-in');el.style.removeProperty('--d');el.style.removeProperty('--dx')},1500);});
      });
    },{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    function prep(el,i){
      if(el.__mo)return;el.__mo=1;
      var sib=el.parentNode?Array.prototype.indexOf.call(el.parentNode.children,el):0;
      el.style.setProperty('--d',((sib%6)*.09)+'s');
      if(el.classList.contains('product-card'))el.style.setProperty('--dx',(sib%2?'34px':'-34px'));
      el.classList.add('mo-rev');io.observe(el);
    }
    function scan(root){
      if(root.nodeType!==1)return;
      if(root.matches&&root.matches(SEL))prep(root);
      var all=root.querySelectorAll?root.querySelectorAll(SEL):[];
      for(var i=0;i<all.length;i++)prep(all[i]);
    }
    scan(document.body);
    new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(scan)})}).observe(document.body,{childList:true,subtree:true});
  }

  /* ---------- decorative moving band under the hero (home page) ---------- */
  function band(){
    var hero=document.querySelector('.hero'); if(!hero||!/index|^\/?$/.test(location.pathname.split('/').pop()||'index'))return;
    var words=['Handcrafted leather','Full-grain leather','Bespoke orders','Handcrafted essentials','Built to last'];
    var html='';for(var r=0;r<2;r++)for(var i=0;i<words.length;i++)html+='<span>'+words[i]+'</span><i></i>';
    var d=document.createElement('div');d.className='mo-band';d.setAttribute('aria-hidden','true');
    d.innerHTML='<div class="mo-band-track">'+html+html+'</div>';
    hero.parentNode.insertBefore(d,hero.nextSibling);
  }

  /* ---------- mouse-follow light (desktop) ---------- */
  function glow(){
    var g0=document.createElement('div');g0.className='mo-glow';document.body.appendChild(g0);
    if(!fine){
      var hide;function at(e){var t=e.touches&&e.touches[0];if(!t)return;g0.style.transform='translate3d('+t.clientX+'px,'+t.clientY+'px,0)';g0.classList.add('on');clearTimeout(hide);hide=setTimeout(function(){g0.classList.remove('on')},900)}
      window.addEventListener('touchstart',at,{passive:true});window.addEventListener('touchmove',at,{passive:true});
      document.addEventListener('pointerdown',function(e){
        if(e.pointerType==='mouse')return;
        var t=e.target.closest&&e.target.closest('.btn,.icon-button,.carousel-control'); if(!t)return;
        var r=t.getBoundingClientRect(),d=Math.max(r.width,r.height)*1.5,s=document.createElement('span');
        s.className='mo-ripple';s.style.cssText='width:'+d+'px;height:'+d+'px;left:'+(e.clientX-r.left-d/2)+'px;top:'+(e.clientY-r.top-d/2)+'px';
        t.appendChild(s);setTimeout(function(){s.remove()},750);
      },{passive:true});
      return;
    }
    var g=g0;
    var x=0,y=0,tx=0,ty=0,on=false;
    window.addEventListener('mousemove',function(e){tx=e.clientX;ty=e.clientY;if(!on){on=true;x=tx;y=ty;g.classList.add('on')}},{passive:true});
    document.addEventListener('mouseleave',function(){on=false;g.classList.remove('on')});
    (function loop(){x+=(tx-x)*.12;y+=(ty-y)*.12;g.style.transform='translate3d('+x+'px,'+y+'px,0)';raf(loop)})();
  }

  /* ---------- smooth fade between pages ---------- */
  function transitions(){
    document.addEventListener('click',function(e){
      var a=e.target.closest&&e.target.closest('a[href]');
      if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
      if(a.target&&a.target!=='_self')return;
      var u;try{u=new URL(a.href,location.href)}catch(x){return}
      if(u.origin!==location.origin||u.pathname===location.pathname&&u.search===location.search||a.hasAttribute('download')||a.hasAttribute('data-whatsapp'))return;
      e.preventDefault();document.body.classList.add('mo-leave');
      setTimeout(function(){location.href=a.href},220);
    });
    window.addEventListener('pageshow',function(e){if(e.persisted)document.body.classList.remove('mo-leave')});
  }

  /* ---------- WhatsApp button: weightless float that follows the phone's tilt ----------
     Phone upright  -> button floats near the bottom-right.
     Phone upside down -> it drifts to the opposite corner, so it stays where your hand/eyes expect it.
     Phone turned left / right -> it slides to that side and keeps floating. */
  function floater(){
    var el=document.querySelector('.whatsapp-float'); if(!el)return;
    el.classList.add('mo-float');
    var vw=0,vh=0,w=0,h=0,M=14;
    var g={x:0,y:1};                       /* where "down" is on the screen, smoothed */
    var p={x:0,y:0,vx:0,vy:0,r:0},started=false;
    var ios=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
    var hdr=document.querySelector('.site-header');
    function measure(){vw=root.clientWidth;vh=window.innerHeight;w=el.offsetWidth;h=el.offsetHeight}
    function target(){
      var rx=g.y,ry=-g.x;                  /* "right" as seen by the person holding the phone */
      var ax=clamp(g.x+rx,-1,1),ay=clamp(g.y+ry,-1,1);
      var top=M;if(hdr){var hb=hdr.getBoundingClientRect().bottom;if(hb>0&&hb<vh*.4)top=Math.max(M,hb+8)}   /* never sit on top of the header */
      return{x:M+(ax+1)/2*Math.max(0,vw-w-2*M),y:top+(ay+1)/2*Math.max(0,vh-h-M-top)};
    }
    function onMotion(e){
      var a=e.accelerationIncludingGravity; if(!a||a.x==null||a.y==null)return;
      var ax=a.x,ay=a.y; if(ios){ax=-ax;ay=-ay}
      var ang=(screen.orientation&&typeof screen.orientation.angle==='number')?screen.orientation.angle:(window.orientation||0);
      ang=((ang%360)+360)%360;
      var sx,sy;
      if(ang===90){sx=ay;sy=ax}else if(ang===180){sx=ax;sy=-ay}else if(ang===270){sx=-ay;sy=-ax}else{sx=-ax;sy=ay}
      var m=Math.hypot(sx,sy),k=clamp((m/9.81-.22)/.4,0,1);   /* lying flat -> keep default corner */
      var tx=m>0?sx/m:0,ty=m>0?sy/m:1;
      tx=tx*k;ty=ty*k+(1-k);
      g.x+=(tx-g.x)*.12;g.y+=(ty-g.y)*.12;
    }
    function listen(){
      if(typeof DeviceMotionEvent==='undefined')return;
      if(typeof DeviceMotionEvent.requestPermission==='function'){
        /* iPhone: the browser asks once, on the first tap */
        var asked=false;
        document.addEventListener('touchend',function ask(){
          if(asked)return;asked=true;
          DeviceMotionEvent.requestPermission().then(function(s){if(s==='granted')window.addEventListener('devicemotion',onMotion)}).catch(function(){});
        },{passive:true});
      }else if(!fine){window.addEventListener('devicemotion',onMotion)}
    }
    function loop(t){
      if(!started){measure();var t0=target();p.x=t0.x;p.y=t0.y;started=true}
      var tg=target();
      /* soft spring = slow, drifting, slightly bouncy movement */
      p.vx+=(tg.x-p.x)*.028;p.vy+=(tg.y-p.y)*.028;p.vx*=.88;p.vy*=.88;p.x+=p.vx;p.y+=p.vy;
      var bx=Math.sin(t/1250)*5,by=Math.cos(t/1010)*8;
      p.r+=((clamp(p.vx*.9,-14,14))-p.r)*.1;
      el.style.transform='translate3d('+(p.x+bx).toFixed(1)+'px,'+(p.y+by).toFixed(1)+'px,0) rotate('+p.r.toFixed(2)+'deg)';
      raf(loop);
    }
    measure();
    window.addEventListener('resize',measure);
    window.addEventListener('orientationchange',function(){setTimeout(measure,250)});
    if('ResizeObserver' in window)new ResizeObserver(measure).observe(el);
    listen();raf(loop);
  }
})();
