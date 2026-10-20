/* ABC WhatsApp connector — direct wa.me links only. */
(function(){
  const FALLBACK='923174960570';
  const digits=v=>String(v||'').replace(/\D/g,'');
  const number=()=>{const configured=digits(window.ABC?.SETTINGS?.()?.whatsapp||'');return configured.length>=7&&configured.length<=15?configured:FALLBACK};
  const url=(message='')=>{const base=`https://wa.me/${number()}/`;return message?`${base}?text=${encodeURIComponent(message)}`:base};
  const GROUP_LINK='https://chat.whatsapp.com/IpyOKaW26NS5VRotbjCC6n';
  const copyText=async t=>{
    try{await navigator.clipboard.writeText(t);return true}catch(e){}
    try{const ta=document.createElement('textarea');ta.value=t;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.focus();ta.select();const ok=document.execCommand('copy');document.body.removeChild(ta);return ok}catch(e){return false}
  };
  function ensureNotice(){
    let el=document.getElementById('waGroupNotice');
    if(el)return el;
    el=document.createElement('div');
    el.id='waGroupNotice';
    el.className='wa-notice-overlay';
    el.innerHTML='<div class="wa-notice-card"><p></p><div class="wa-notice-actions"><button type="button" class="wa-notice-ok">Got it</button><a class="wa-notice-review" href="reviews.html#reviewForm">Tell us about the product →</a></div></div>';
    document.body.appendChild(el);
    const close=()=>el.classList.remove('show');
    el.addEventListener('click',e=>{if(e.target===el||e.target.classList.contains('wa-notice-ok'))close()});
    return el;
  }
  function showNotice(message,opts){
    const el=ensureNotice();
    el.querySelector('p').textContent=message;
    const reviewLink=el.querySelector('.wa-notice-review');
    if(reviewLink)reviewLink.style.display=(opts&&opts.showReviewLink)?'inline-block':'none';
    requestAnimationFrame(()=>el.classList.add('show'));
  }
  window.ABC_WHATSAPP={FALLBACK,number,url,GROUP_LINK,copyText,showNotice,
    sendToGroup:async(message='',opts={})=>{
      const copied=await copyText(message);
      window.location.href=GROUP_LINK;
      const copiedMsg=opts.copiedMessage||'Your order has been copied. Just paste it in the WhatsApp group and hit send.';
      const failMsg=opts.failMessage||'Please copy the details above and paste them in the WhatsApp group, then hit send.';
      showNotice(copied?copiedMsg:failMsg,{showReviewLink:!!opts.showReviewLink});
      return copied;
    }
  };
})();
