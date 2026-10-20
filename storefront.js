const DB=window.BELTYX_DB;
const FALLBACK_PRODUCTS=[];
let PRODUCTS=FALLBACK_PRODUCTS, CATEGORIES=[{slug:'wallets',name:'Wallets',image_url:'assets/bifold-wallet.png'},{slug:'belts',name:'Belts',image_url:'assets/leather-belt.png'},{slug:'bags',name:'Bags',image_url:'assets/messenger-bag.png'},{slug:'accessories',name:'Accessories',image_url:'assets/wallet-slim.png'},{slug:'giftsets',name:'Gift Sets',image_url:'assets/gift-set-category.png',note:"Live in another city? No problem — just share your address at checkout and we'll ship your gift anywhere we deliver."},{slug:'bespoke',name:'Bespoke',image_url:'assets/crossbody-bag.png'}];
let SKETCHES=[];
let SETTINGS={whatsapp:'923174960570',productWhatsapps:{},salePrices:{},location:{name:'BELTYX',address:'Lincolnshire, UK',city:'United Kingdom',map:'https://maps.google.com/'},trust:[{title:'Handmade',sub:'Crafted with intent'},{title:'Natural leather',sub:'Character that develops'},{title:'Bespoke',sub:'Made around you'},{title:'Built to last',sub:'Designed beyond trends'}]};
const $=id=>document.getElementById(id); const esc=v=>String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\':'&#92;','"':'&quot;'}[m]));
const CURRENCY_INFO={
 PKR:{symbol:'₨',name:'PKR',locale:'en-PK',rate:1},
 EUR:{symbol:'€',name:'EUR',locale:'de-DE',rate:0.0033},
 USD:{symbol:'$',name:'USD',locale:'en-US',rate:0.00357},
 SAR:{symbol:'﷼',name:'SAR',locale:'en-SA',rate:0.01338},
 GBP:{symbol:'£',name:'GBP',locale:'en-GB',rate:0.00264},
 AED:{symbol:'د.إ',name:'AED',locale:'en-AE',rate:0.0131},
 CAD:{symbol:'C$',name:'CAD',locale:'en-CA',rate:0.00485},
 AUD:{symbol:'A$',name:'AUD',locale:'en-AU',rate:0.0054},
 CNY:{symbol:'¥',name:'CNY',locale:'zh-CN',rate:0.0258},
 JPY:{symbol:'¥',name:'JPY',locale:'ja-JP',rate:0.53}
};
let LIVE_RATES={};
const productCurrency=p=>String((SETTINGS.productCurrencies||{})[String(p?.id)]||'GBP').toUpperCase();
const basePrice=(p)=>Number(p?.price||0);
const salePricePKR=(p)=>{const v=Number((SETTINGS.salePrices||{})[String(p?.id)]||0);return v>0&&v<basePrice(p)?v:null};
const convertedValue=(p,pkr)=>{const code=productCurrency(p),info=CURRENCY_INFO[code]||CURRENCY_INFO.GBP;const rate=Number(LIVE_RATES[code]||info.rate);return Number(pkr||0)*rate};
const convertedPrice=(p)=>convertedValue(p,basePrice(p));
const displayPrices=(p)=>{const real=convertedValue(p,basePrice(p)),sale=salePricePKR(p);return {real,sale:sale?convertedValue(p,sale):null}};
const money=(n,p)=>{
 const code=p?productCurrency(p):'PKR',info=CURRENCY_INFO[code]||CURRENCY_INFO.PKR;
 const value=p?Number(n):Number(n||0);
 return `${info.symbol}${value.toLocaleString(info.locale,{minimumFractionDigits:code==='PKR'?0:2,maximumFractionDigits:code==='PKR'?0:2})}`;
};
const discountPercent=(p)=>{const sale=salePricePKR(p),real=basePrice(p);return sale!==null&&real>0?Math.round(((real-sale)/real)*100):0};
const priceHTML=(p)=>{const x=displayPrices(p),discount=discountPercent(p);if(x.sale!==null)return `<span class="price-sale">${money(x.sale,p)}</span> <del class="price-old">${money(x.real,p)}</del> <span class="discount-badge">${discount}% OFF</span>`;return money(x.real,p)};
const effectivePricePKR=(p)=>salePricePKR(p)??basePrice(p);
const moneyPKR=n=>`₨${Number(n||0).toLocaleString('en-PK')}`;
const img=p=>(Array.isArray(p.media)?p.media:[]).find(m=>m.type==='image'&&m.url)?.url||p.image||'assets/messenger-bag.png';
const media=p=>Array.isArray(p.media)&&p.media.length?p.media:[{type:'image',url:img(p)}];
function cartGet(){try{return JSON.parse(localStorage.getItem('BELTYX_CART')||'[]')}catch{return[]}}
function cartSet(v){localStorage.setItem('BELTYX_CART',JSON.stringify(v));window.dispatchEvent(new Event('beltyx-cart'))}
function visitorId(){let v=localStorage.getItem('ABC_VISITOR_ID');if(!v){v=(crypto.randomUUID?crypto.randomUUID():('v_'+Date.now()+'_'+Math.random().toString(36).slice(2)));localStorage.setItem('ABC_VISITOR_ID',v)}return v}
async function trackActivity(action,productId){
 try{if(!window.ABC_DB||!productId)return;await window.ABC_DB.from('abc_product_activity').insert({visitor_id:visitorId(),product_id:Number(productId),action})}catch(e){console.warn('activity tracking',e)}
}
function addCart(id,qty=1){const c=cartGet(),x=c.find(i=>Number(i.id)===Number(id));if(x)x.qty+=qty;else c.push({id:Number(id),qty});cartSet(c);renderCartCount();trackActivity('add_to_cart',id);toast('Added to your bag');}
function wishGet(){try{return JSON.parse(localStorage.getItem('ABC_WISHLIST')||'[]')}catch{return[]}}
function wishSet(v){localStorage.setItem('ABC_WISHLIST',JSON.stringify(v));window.dispatchEvent(new Event('abc-wishlist'))}
function isWished(id){return wishGet().some(x=>Number(x)===Number(id))}
function toggleWishlist(id){const w=wishGet(),idx=w.findIndex(x=>Number(x)===Number(id));if(idx>=0){w.splice(idx,1);wishSet(w);toast('Removed from wishlist')}else{w.push(Number(id));wishSet(w);trackActivity('add_to_wishlist',id);toast('Added to wishlist')}return idx<0}
function refreshPriceDisplays(){document.querySelectorAll('[data-product-id]').forEach(card=>{const id=Number(card.dataset.productId),p=PRODUCTS.find(x=>Number(x.id)===id),el=card.querySelector('[data-product-price]');if(p&&el)el.innerHTML=priceHTML(p)});const d=document.querySelector('[data-detail-price]');if(d){const id=Number(new URLSearchParams(location.search).get('id')),p=PRODUCTS.find(x=>Number(x.id)===id);if(p)d.innerHTML=priceHTML(p)}}
function renderCartCount(){document.querySelectorAll('[data-cart-count]').forEach(x=>x.textContent=cartGet().reduce((s,i)=>s+Number(i.qty||0),0))}
function toast(t){let x=$('toast');if(!x){x=document.createElement('div');x.id='toast';x.className='toast';document.body.appendChild(x)}x.textContent=t;x.classList.add('show');setTimeout(()=>x.classList.remove('show'),2200)}
function productCard(p){return `<article class="product-card" data-product-id="${p.id}"><a class="product-media" href="product.html?id=${encodeURIComponent(p.id)}"><span class="product-badge">${esc(p.badge||'CRAFTED')}</span><img loading="lazy" src="${esc(img(p))}" alt="${esc(p.name)}" onerror="this.src='assets/messenger-bag.png'"><button type="button" class="card-wish" aria-label="Add to wishlist" onclick="event.preventDefault();event.stopPropagation();ABC.toggleWishlist(${p.id})">♡</button><span class="media-overlay">View piece <b>↗</b></span></a><div class="product-copy"><div><p class="product-category">${esc(p.category)}</p><h3><a href="product.html?id=${encodeURIComponent(p.id)}">${esc(p.name)}</a></h3><p>${esc(p.desc||'Made with purpose.')}</p></div><div class="product-bottom"><strong data-product-price>${priceHTML(p)}</strong><button class="mini-add" onclick="addCart(${p.id})">Add</button></div></div></article>`}
async function loadStore(){if(!DB){renderCartCount();applySettings();document.dispatchEvent(new CustomEvent('beltyx-ready'));return}try{const [pr,st,md,ap,am]=await Promise.all([DB.from('products').select('*').eq('is_live',true).order('sort_order').order('id'),DB.from('store_settings').select('*'),DB.from('product_media').select('*').order('sort_order').order('id'),DB.from('abc_products').select('*').eq('is_live',true).order('sort_order').order('id'),DB.from('abc_product_media').select('*').order('sort_order').order('id')]);if(pr.error)console.warn('BELTYX products query failed:',pr.error.message);if(ap.error)console.warn('BELTYX abc_products query failed:',ap.error.message);if(md.error)console.warn('BELTYX product_media query failed:',md.error.message);if(am.error)console.warn('BELTYX abc_product_media query failed:',am.error.message);const shared=(!pr.error&&pr.data)?pr.data:[];const own=(!ap.error&&ap.data)?ap.data:[];const allMedia=[...((!md.error&&md.data)?md.data.map(m=>({...m,_table:'products'})):[]),...((!am.error&&am.data)?am.data.map(m=>({...m,_table:'abc_products'})):[])];const mm={};allMedia.forEach(m=>(mm[`${m._table}:${m.product_id}`]??=[]).push({id:m.id,type:m.media_type,url:m.url,title:m.title||''}));PRODUCTS=[...shared.map(p=>({...p,_table:'products'})),...own.map(p=>({...p,_table:'abc_products'}))].map(p=>({...p,image:p.image_url,desc:p.description,media:mm[`${p._table}:${p.id}`]||[]}));if(!st.error){const m={};(st.data||[]).forEach(x=>m[x.key]=x.value);if(m.categories)CATEGORIES=m.categories;if(m.whatsapp)SETTINGS.whatsapp=String(m.whatsapp);if(m.location)SETTINGS.location=m.location;if(m.trust)SETTINGS.trust=m.trust;if(m.product_currencies)SETTINGS.productCurrencies=m.product_currencies;if(m.product_whatsapps)SETTINGS.productWhatsapps=m.product_whatsapps;if(m.sale_prices)SETTINGS.salePrices=m.sale_prices;if(m.sketches)SKETCHES=Array.isArray(m.sketches)?m.sketches:[]}applySettings();renderCartCount();document.dispatchEvent(new CustomEvent('beltyx-ready'));subscribeLive()}catch(e){console.warn(e);renderCartCount();document.dispatchEvent(new CustomEvent('beltyx-ready'))}}
function whatsappUrl(message='Hi BELTYX, I would like to make a leather goods enquiry.') {
  const fallback='923174960570';
  const configured=String(SETTINGS.whatsapp||'').replace(/\D/g,'');
  const n=(configured.length>=7&&configured.length<=15)?configured:fallback;
  return `https://wa.me/${n}/?text=${encodeURIComponent(message)}`;
}
function applySettings(){
  const enquiryUrl=whatsappUrl();
  document.querySelectorAll('[data-whatsapp]').forEach(a=>{
    a.href=enquiryUrl; a.target='_blank'; a.rel='noopener noreferrer';
    a.setAttribute('aria-label',a.getAttribute('aria-label')||'WhatsApp enquiry');
  });
  document.querySelectorAll('[data-location]').forEach(x=>x.textContent=SETTINGS.location?.address||'Worldwide');
  document.querySelectorAll('[data-store-name]').forEach(x=>x.textContent=SETTINGS.location?.name||'BELTYX');
  document.querySelectorAll('[data-wa-number]').forEach(x=>x.textContent=String(SETTINGS.whatsapp||'923174960570').replace(/\D/g,''));
}
let liveChannel=null;function subscribeLive(){if(!DB||liveChannel)return;liveChannel=DB.channel('abc-storefront-v3').on('postgres_changes',{event:'*',schema:'public',table:'products'},loadStore).on('postgres_changes',{event:'*',schema:'public',table:'product_media'},loadStore).on('postgres_changes',{event:'*',schema:'public',table:'abc_products'},loadStore).on('postgres_changes',{event:'*',schema:'public',table:'abc_product_media'},loadStore).on('postgres_changes',{event:'*',schema:'public',table:'store_settings'},loadStore).subscribe()}
function setupNav(){const toggle=$('menuToggle'),nav=$('siteNav');toggle?.addEventListener('click',()=>{nav.classList.toggle('open');toggle.classList.toggle('open')});document.querySelectorAll('[data-search-open]').forEach(b=>b.addEventListener('click',()=>{$('searchOverlay')?.classList.add('open');$('siteSearch')?.focus()}));$('searchClose')?.addEventListener('click',()=>$('searchOverlay')?.classList.remove('open'));$('siteSearch')?.addEventListener('keydown',e=>{if(e.key==='Enter'){const q=e.target.value.trim();location.href='shop.html'+(q?'?q='+encodeURIComponent(q):'')}});window.addEventListener('scroll',()=>document.body.classList.toggle('scrolled',scrollY>30),{passive:true});document.body.classList.toggle('scrolled',scrollY>30);document.addEventListener('mousemove',e=>{const m=e.target.closest&&e.target.closest('.product-media, .gallery-main.magnify-main');if(!m)return;const r=m.getBoundingClientRect();m.style.setProperty('--mx',(e.clientX-r.left)+'px');m.style.setProperty('--my',(e.clientY-r.top)+'px')},{passive:true});}
function initReveal(){const els=document.querySelectorAll('[data-reveal]');if(!('IntersectionObserver'in window)){els.forEach(x=>x.classList.add('visible'));return}const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});els.forEach(x=>io.observe(x))}
async function refreshLiveRates(){try{const r=await fetch('https://open.er-api.com/v6/latest/PKR',{cache:'no-store'});const j=await r.json();if(j&&j.rates){['EUR','USD','SAR','GBP','AED','CAD','AUD','CNY','JPY'].forEach(c=>{if(j.rates[c])LIVE_RATES[c]=Number(j.rates[c])});refreshPriceDisplays();const evt=new Event('abc-rates-updated');window.dispatchEvent(evt)}}catch(e){console.warn('Using fallback currency rates',e)}}
async function injectYear(){document.querySelectorAll('[data-year]').forEach(x=>x.textContent=new Date().getFullYear())}
function initReviewNudge(){
  if(document.body.classList.contains('admin-body'))return;
  const page=(location.pathname.split('/').pop()||'index.html');
  if(page==='reviews.html'||page==='cart.html'||page==='admin.html')return;
  if(sessionStorage.getItem('abc_review_nudge_shown'))return;
  setTimeout(()=>{
    if(sessionStorage.getItem('abc_review_nudge_shown'))return;
    sessionStorage.setItem('abc_review_nudge_shown','1');
    const el=document.createElement('div');
    el.className='review-nudge';
    el.innerHTML='<button type="button" class="review-nudge-close" aria-label="Close">×</button><p>Enjoying BELTYX so far?</p><span>We would love a quick word about your experience browsing the site.</span><a href="reviews.html#reviewForm">Leave a review →</a>';
    document.body.appendChild(el);
    requestAnimationFrame(()=>el.classList.add('show'));
    el.querySelector('.review-nudge-close').addEventListener('click',()=>{el.classList.remove('show');setTimeout(()=>el.remove(),450)});
  },17000);
}
function initBase(){setupNav();injectYear();initReveal();loadStore();initReviewNudge();refreshLiveRates()}
window.ABC={PRODUCTS:()=>PRODUCTS,CATEGORIES:()=>CATEGORIES,SETTINGS:()=>SETTINGS,SKETCHES:()=>SKETCHES,money,moneyPKR,img,media,esc,productCard,addCart,cartGet,cartSet,wishGet,wishSet,isWished,toggleWishlist,visitorId,trackActivity,loadStore,toast,refreshLiveRates};
window.addEventListener('beltyx-cart',renderCartCount); document.addEventListener('DOMContentLoaded',initBase);

window.addEventListener('abc-rates-updated',()=>{document.dispatchEvent(new Event('abc-price-refresh'))});
ABC.priceHTML=priceHTML;ABC.effectivePricePKR=effectivePricePKR;ABC.convertedValue=convertedValue;

/* ABC v9 — mobile header that never disappears.
   On phones/tablets (<=900px) the header is pinned with position:fixed (works on every
   mobile browser, unlike position:sticky which breaks when a parent has overflow hidden).
   A spacer keeps the page layout in place; the header sits under the announcement bar at the
   top of the page and glides up to the very top as you scroll. */
(function(){
  function start(){
    var hdr=document.querySelector('.site-header');
    if(!hdr||document.body.classList.contains('admin-body'))return;
    var mq=window.matchMedia('(max-width:900px)'),root=document.documentElement,spacer=null,annH=0,ticking=false;
    function annHeight(){var a=document.querySelector('.announcement');return a?a.getBoundingClientRect().height:0}
    function position(){
      ticking=false;
      if(!mq.matches)return;
      var top=Math.max(0,annH-(window.pageYOffset||0));
      root.style.setProperty('--abc-hdr-top',top+'px');
    }
    function measure(){
      if(!mq.matches){
        root.classList.remove('abc-fixednav');
        if(spacer){spacer.remove();spacer=null}
        root.style.removeProperty('--abc-hdr-top');root.style.removeProperty('--abc-hdr-h');
        return;
      }
      if(!spacer){
        annH=annHeight();
        spacer=document.createElement('div');spacer.className='abc-header-spacer';spacer.setAttribute('aria-hidden','true');
        hdr.parentNode.insertBefore(spacer,hdr);
        spacer.style.height=hdr.offsetHeight+'px';
        root.classList.add('abc-fixednav');
      }
      annH=annHeight();
      var h=hdr.offsetHeight;
      spacer.style.height=h+'px';
      root.style.setProperty('--abc-hdr-h',h+'px');
      position();
    }
    function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(position)}}
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',measure);
    window.addEventListener('orientationchange',function(){setTimeout(measure,250)});
    window.addEventListener('pageshow',measure);
    window.addEventListener('load',measure);
    if(mq.addEventListener)mq.addEventListener('change',measure);else if(mq.addListener)mq.addListener(measure);
    if('ResizeObserver' in window){
      var ro=new ResizeObserver(function(){measure()});ro.observe(hdr);
      var ann=document.querySelector('.announcement');if(ann)ro.observe(ann);
    }
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(measure);
    measure();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
