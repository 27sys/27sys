/**
 * 27SYS SERVICES — CONFIGURATION CENTRALE
 */
const CONFIG = {
  business: { name:"27sys Services", shortName:"27sys", tagline:"Particuliers • Professionnels • PC Gaming • Réseaux", city:"Casablanca", country:"Maroc", footerSignature:"27SYS // BUILDING SYSTEMS, ONE PC AT A TIME." },
  contact: { whatsappNumber:"212640008930", whatsappMessage:"Bonjour 27sys, j'aimerais avoir des informations concernant : ", phoneDisplay:"+212 6 40 00 89 30", phoneHref:"+212640008930", email:"nbenramou@gmail.com" },
  social: { linkedin:"https://www.linkedin.com/in/nizar-benramou-0a9847b6/", googleBusiness:"" },
  location: { areaLabel:"Casablanca • Intervention à domicile / sur rendez-vous", addressLine:"Casablanca et périphérie", hours:"Lun. – Sam. · 9h00 – 19h00 · sur rendez-vous" },
  pricing: { diagnostic:"", homeVisitNote:"Déplacement à domicile facturé séparément, annoncé avant intervention." },
  images: { aboutPhoto:"https://raw.githubusercontent.com/Nizar404/27Sys_Service_Website/main/images/hero-technicien.webp.png?v=2", ogImage:"" },
  seo: { siteUrl:"https://www.27sys.ma" }
};

/* 27SYS HERO — full-screen workshop image behind the hero copy. */
(function(){
  const style=document.createElement('style');
  style.id='27sys-hero-background';
  style.textContent=`
    .hero{
      position:relative;
      min-height:100vh!important;
      padding:150px 0 90px!important;
      display:flex;
      align-items:center;
      color:#fff!important;
      background-color:#111820!important;
      background-image:
        linear-gradient(90deg,rgba(7,12,17,.88) 0%,rgba(7,12,17,.72) 38%,rgba(7,12,17,.34) 68%,rgba(7,12,17,.18) 100%),
        linear-gradient(180deg,rgba(7,12,17,.40) 0%,rgba(7,12,17,.06) 36%,rgba(7,12,17,.44) 100%),
        url('https://raw.githubusercontent.com/Nizar404/nizar404.github.io/main/images/Hero-technicien2.png?v=1')!important;
      background-size:cover!important;
      background-position:center center!important;
      background-repeat:no-repeat!important;
      overflow:hidden;
    }
    .hero:before{color:rgba(255,255,255,.035)!important;z-index:0}
    .hero-grid{opacity:.12!important;background-image:linear-gradient(to right,rgba(255,255,255,.13) 1px,transparent 1px)!important;z-index:0}
    .hero-inner{width:min(1240px,calc(100% - 48px));grid-template-columns:1fr!important;gap:0!important;align-items:center!important;z-index:2}
    .hero-copy{max-width:820px;position:relative;z-index:4}
    .hero .eyebrow{color:rgba(255,255,255,.78)!important;text-shadow:0 2px 12px rgba(0,0,0,.35)}
    .hero .eyebrow-dot{background:#FF7A45;box-shadow:0 0 0 4px rgba(255,122,69,.18)}
    .hero-title{max-width:780px!important;margin-bottom:26px!important;color:#fff!important;font-size:clamp(4rem,7.3vw,7.2rem)!important;line-height:.88!important;letter-spacing:-.065em!important;text-shadow:0 4px 26px rgba(0,0,0,.30)}
    .hero-title em{color:#8FD0FF!important}
    .hero-sub{max-width:680px!important;margin-bottom:34px!important;color:rgba(255,255,255,.86)!important;font-size:18px!important;line-height:1.65!important;text-shadow:0 2px 14px rgba(0,0,0,.28)}
    .hero-sub strong{color:#fff!important}
    .hero-ctas{margin-bottom:38px!important}
    .hero .btn-primary{background:#fff!important;color:#15181C!important;border-color:#fff!important;box-shadow:0 10px 28px rgba(0,0,0,.18)}
    .hero .btn-primary:hover{background:#1677FF!important;color:#fff!important;border-color:#1677FF!important}
    .hero .btn-ghost{color:#fff!important;border-color:rgba(255,255,255,.72)!important;background:rgba(10,15,20,.12)!important;backdrop-filter:blur(4px)}
    .hero .btn-ghost:hover{background:#fff!important;color:#15181C!important;border-color:#fff!important}
    .hero-facts{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr));max-width:760px!important;border-top:1px solid rgba(255,255,255,.3)!important;padding-top:18px!important}
    .hero-facts span{padding:0 18px 0 0!important;margin:0 18px 0 0!important;border-right:1px solid rgba(255,255,255,.22)!important;color:rgba(255,255,255,.9)!important;font-family:var(--body)!important;font-size:11px!important;letter-spacing:0!important;text-transform:none!important;text-shadow:0 2px 10px rgba(0,0,0,.25)}
    .hero-facts span:last-child{border:0!important;margin-right:0!important}
    .hero-facts b{display:block!important;margin:0 0 6px!important;color:#FF8B5C!important;font-family:var(--mono)!important;font-size:10px!important}
    .hero-visual{display:none!important}
    .hero:after{content:'27SYS / WORKSHOP 01  ·  CASABLANCA / MA';position:absolute;right:34px;top:102px;z-index:3;color:rgba(255,255,255,.64);font-family:var(--mono);font-size:9px;letter-spacing:.12em;writing-mode:vertical-rl;text-orientation:mixed;text-shadow:0 2px 12px rgba(0,0,0,.3)}
    .site-header{background:linear-gradient(180deg,rgba(7,12,17,.38),rgba(7,12,17,0))!important;border-bottom-color:transparent!important}
    .site-header.is-scrolled{background:rgba(244,243,238,.95)!important;border-bottom-color:var(--line)!important}
    .hero~.segments{border-top-color:var(--line)}
    @media(max-width:900px){
      .hero{min-height:100svh!important;padding:125px 0 70px!important;background-position:58% center!important}
      .hero-facts{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:14px 0}
      .hero-facts span{border:0!important;margin:0!important;padding-right:14px!important}
      .hero:after{right:14px;top:86px;font-size:8px}
    }
    @media(max-width:600px){
      .hero-inner{width:calc(100% - 32px)!important}
      .hero-title{font-size:clamp(3.35rem,15vw,5.3rem)!important}
      .hero-sub{font-size:16px!important;max-width:560px!important}
      .hero:after{display:none}
    }
  `;
  document.head.appendChild(style);
})();

(function(){
  const NEED_IMAGES=[
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1800&q=85',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1800&q=85',
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1800&q=85',
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1800&q=85'
  ];
  const css=`
.ask{overflow:hidden}.ask .section-head{position:relative;z-index:2}.ask-carousel{position:relative;margin-top:4px}.ask-viewport{overflow:hidden;border:1px solid rgba(244,243,238,.18);background:#0e1217;box-shadow:0 30px 80px rgba(0,0,0,.18)}.ask-track{display:flex;transition:transform .75s cubic-bezier(.16,1,.3,1);will-change:transform}.ask-track .ask-card{flex:0 0 100%;min-height:470px;border:0;padding:0;display:flex;align-items:flex-end;background:#10161d center/cover no-repeat;text-decoration:none;isolation:isolate;overflow:hidden}.ask-track .ask-card:before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,8,12,.92) 0%,rgba(5,8,12,.66) 42%,rgba(5,8,12,.18) 76%,rgba(5,8,12,.06) 100%);z-index:-1}.ask-track .ask-card:after{content:'';position:absolute;inset:18px;border:1px solid rgba(255,255,255,.13);pointer-events:none}.ask-card-content{position:relative;width:min(100%,660px);padding:54px 64px 58px;z-index:1}.ask-track .ask-number{display:inline-flex;align-items:center;gap:14px;margin:0 0 24px;color:#ff8b5c;font-family:var(--mono);font-size:11px;letter-spacing:.14em}.ask-track .ask-number:after{content:'';width:64px;height:1px;background:currentColor;opacity:.75}.ask-track .ask-card-title{max-width:14ch;margin-bottom:14px;font-size:clamp(2.1rem,4.2vw,4.5rem);line-height:.95;letter-spacing:-.055em;text-shadow:0 2px 18px rgba(0,0,0,.2)}.ask-track .ask-card-desc{max-width:46ch;color:rgba(255,255,255,.78);font-size:16px;line-height:1.6}.ask-track .ask-card-arrow{right:34px;bottom:30px;width:52px;height:52px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.35);color:#fff;font-size:22px;transition:.25s var(--ease)}.ask-track .ask-card:hover{padding-left:0;background-color:#10161d}.ask-track .ask-card:hover .ask-card-arrow{background:var(--orange);border-color:var(--orange);transform:translateX(4px)}.ask-carousel-controls{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:20px}.ask-carousel-dots{display:flex;gap:9px}.ask-carousel-dot{width:34px;height:2px;padding:0;border:0;background:rgba(244,243,238,.24);cursor:pointer;transition:.25s var(--ease)}.ask-carousel-dot.is-active{background:var(--orange)}.ask-carousel-buttons{display:flex;gap:8px}.ask-carousel-button{width:44px;height:44px;border:1px solid rgba(244,243,238,.28);display:grid;place-items:center;color:#fff;font-size:20px;transition:.25s var(--ease)}.ask-carousel-button:hover{background:var(--white);color:var(--ink);border-color:var(--white)}.ask-carousel-meta{font-family:var(--mono);font-size:10px;letter-spacing:.1em;color:rgba(244,243,238,.48);text-transform:uppercase}@media(max-width:700px){.ask-track .ask-card{min-height:520px;background-position:center}.ask-track .ask-card:before{background:linear-gradient(0deg,rgba(5,8,12,.95) 0%,rgba(5,8,12,.72) 47%,rgba(5,8,12,.08) 100%)}.ask-card-content{padding:36px 28px 40px}.ask-track .ask-card-title{font-size:clamp(2.25rem,11vw,3.5rem)}.ask-track .ask-card-desc{font-size:14px}.ask-track .ask-card-arrow{right:24px;bottom:22px;width:46px;height:46px}.ask-carousel-controls{margin-top:14px}.ask-carousel-meta{display:none}}
`;
  function mountCarousel(){
    const grid=document.querySelector('.ask-grid');if(!grid||grid.dataset.carouselMounted)return;grid.dataset.carouselMounted='true';
    const cards=Array.from(grid.querySelectorAll('.ask-card'));if(!cards.length)return;
    const carousel=document.createElement('div');carousel.className='ask-carousel';
    const viewport=document.createElement('div');viewport.className='ask-viewport';
    const track=document.createElement('div');track.className='ask-track';viewport.appendChild(track);
    cards.forEach((card,index)=>{card.style.backgroundImage=`url(\"${NEED_IMAGES[index]}\")`;const content=document.createElement('span');content.className='ask-card-content';while(card.firstChild)content.appendChild(card.firstChild);card.appendChild(content);track.appendChild(card)});
    const controls=document.createElement('div');controls.className='ask-carousel-controls';const dots=document.createElement('div');dots.className='ask-carousel-dots';const meta=document.createElement('div');meta.className='ask-carousel-meta';const buttons=document.createElement('div');buttons.className='ask-carousel-buttons';const previous=document.createElement('button');previous.type='button';previous.className='ask-carousel-button';previous.setAttribute('aria-label','Situation précédente');previous.textContent='←';const next=document.createElement('button');next.type='button';next.className='ask-carousel-button';next.setAttribute('aria-label','Situation suivante');next.textContent='→';buttons.append(previous,next);controls.append(dots,meta,buttons);
    let current=0,timer;function restart(){clearInterval(timer);if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)timer=setInterval(()=>go(current+1,false),5200)}function go(index,manual){current=(index+cards.length)%cards.length;track.style.transform=`translateX(-${current*100}%)`;Array.from(dots.children).forEach((dot,i)=>dot.classList.toggle('is-active',i===current));meta.textContent=`${String(current+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')} — FAITES DÉFILER OU CHOISISSEZ`;if(manual)restart()}
    cards.forEach((_,index)=>{const dot=document.createElement('button');dot.type='button';dot.className='ask-carousel-dot'+(index===0?' is-active':'');dot.setAttribute('aria-label',`Voir la situation ${index+1}`);dot.addEventListener('click',()=>go(index,true));dots.appendChild(dot)});
    previous.addEventListener('click',()=>go(current-1,true));next.addEventListener('click',()=>go(current+1,true));carousel.addEventListener('mouseenter',()=>clearInterval(timer));carousel.addEventListener('mouseleave',restart);carousel.addEventListener('focusin',()=>clearInterval(timer));carousel.addEventListener('focusout',restart);grid.replaceWith(carousel);carousel.append(viewport,controls);go(0,false);restart();
  }
  const style=document.createElement('style');style.id='ask-carousel-style';style.textContent=css;document.head.appendChild(style);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountCarousel);else mountCarousel();
})();