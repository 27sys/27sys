(() => {
  'use strict';

  const WA = '212640008930';
  const dataUrl = 'knowledge/assistance-tree.json';
  const state = { category:null, subcategory:null, brand:null, problem:null, step:0, trail:[], answers:[] };
  let db = null;

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = (value='') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  async function load(){
    const res=await fetch(dataUrl,{cache:'no-store'});
    if(!res.ok) throw new Error(`Impossible de charger la base (${res.status})`);
    db=await res.json(); renderSources(); renderCategories(); renderHome();
  }

  function renderSources(){ $('#source-list').innerHTML=db.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)} ↗</a>`).join(''); }

  function renderCategories(){
    $('#category-list').innerHTML=db.categories.map(c=>`<button class="category-item ${state.category===c.id?'active':''}" data-cat="${esc(c.id)}"><span class="category-icon">${esc(c.icon)}</span><span class="category-text"><strong>${esc(c.label)}</strong><span>${esc(c.description)}</span></span></button>`).join('');
    $$('.category-item').forEach(btn=>btn.addEventListener('click',()=>{const cat=db.categories.find(c=>c.id===btn.dataset.cat);if(!cat)return;state.category=cat.id;state.subcategory=null;state.brand=null;state.problem=null;state.step=0;state.answers=[];state.trail=[cat.label];renderCategories();renderSubcategories(cat);scrollTree();}));
  }

  function renderStepper(active){const labels=['Catégorie','Système / type','Marque / modèle','Problème','Dépannage'];$('#stepper').innerHTML=labels.map((label,i)=>`<span class="step-chip ${i<active?'done':''} ${i===active?'active':''}"><i>${i+1}</i>${label}</span>${i<4?'<span class="step-arrow">→</span>':''}`).join('');}
  function breadcrumbs(){const items=state.trail.length?state.trail:['Accueil','Arbre de décision'];$('#breadcrumbs').innerHTML=items.map((x,i)=>`<span class="crumb ${i===items.length-1?'current':''}">${esc(x)}</span>${i<items.length-1?'<span>›</span>':''}`).join('');}
  function setView(title,subtitle,body,step=0){renderStepper(step);breadcrumbs();$('#view').innerHTML=`<div class="view-kicker">27SYS / DIAGNOSTIC STRUCTURÉ</div><h2 class="view-title">${esc(title)}</h2><p class="view-subtitle">${esc(subtitle)}</p>${body}`;}

  function renderHome(){
    state.category=null;state.subcategory=null;state.brand=null;state.problem=null;state.step=0;state.trail=[];state.answers=[];
    setView('Choisissez votre catégorie','Commencez par l’équipement ou l’environnement qui présente le problème.',`<div class="selection-grid">${db.categories.map((c,i)=>`<button class="select-card cat-card" data-cat="${esc(c.id)}"><span class="select-number">0${i+1}</span><h3>${esc(c.icon)} ${esc(c.label)}</h3><p>${esc(c.description)}</p></button>`).join('')}</div>`,0);
    $$('.cat-card').forEach(b=>b.addEventListener('click',()=>{const cat=db.categories.find(c=>c.id===b.dataset.cat);state.category=cat.id;state.trail=[cat.label];renderCategories();renderSubcategories(cat);scrollTree();}));
  }

  function renderSubcategories(cat){
    setView(cat.label,'Sélectionnez le système ou le type d’équipement qui correspond le mieux à votre situation.',`<div class="selection-grid">${cat.subcategories.map((s,i)=>`<button class="select-card sub-card" data-sub="${esc(s.id)}"><span class="select-number">0${i+1}</span><h3>${esc(s.label)}</h3><p>${esc(s.brands.length)} familles / marques • ${esc(s.problems.length)} problèmes guidés</p></button>`).join('')}</div>`,1);
    $$('.sub-card').forEach(b=>b.addEventListener('click',()=>{state.subcategory=b.dataset.sub;state.brand=null;state.problem=null;state.step=0;state.answers=[];const sub=cat.subcategories.find(x=>x.id===state.subcategory);state.trail=[cat.label,sub.label];renderBrands(sub);scrollTree();}));
  }

  function renderBrands(sub){
    setView(sub.label,'Choisissez une grande famille de marque ou modèle. Les procédures restent génériques quand plusieurs modèles partagent le même comportement.',`<div class="brand-grid">${sub.brands.map(b=>`<button class="brand-card" data-brand="${esc(b)}"><strong>${esc(b)}</strong></button>`).join('')}</div><div class="tree-empty" style="margin-top:18px">La marque est un repère : les étapes restent basées sur le symptôme et les pratiques N1.</div>`,2);
    $$('.brand-card').forEach(b=>b.addEventListener('click',()=>{state.brand=b.dataset.brand;state.problem=null;state.step=0;state.answers=[];state.trail=[...state.trail,state.brand];const cat=db.categories.find(c=>c.id===state.category);const s=cat.subcategories.find(x=>x.id===state.subcategory);renderProblems(s);scrollTree();}));
  }

  function renderProblems(sub){
    setView('Quel est le symptôme ?','Choisissez le problème le plus proche. Vous pourrez revenir en arrière si vous vous êtes trompé.',`<div class="problem-grid">${sub.problems.map(id=>{const f=db.flows[id];return `<button class="problem-card" data-problem="${esc(id)}"><span><strong>${esc(f?.title||id)}</strong><small>Diagnostic guidé N1</small></span><span>→</span></button>`}).join('')}</div>`,3);
    $$('.problem-card').forEach(b=>b.addEventListener('click',()=>{state.problem=b.dataset.problem;state.step=0;state.answers=[];state.trail=[...state.trail,db.flows[state.problem].title];renderDiagnostic();scrollTree();}));
  }

  function renderDiagnostic(){
    const flow=db.flows[state.problem]; if(!flow)return renderHome();
    const step=flow.steps[state.step]||flow.steps[flow.steps.length-1];
    setView(flow.title,'Répondez à la question, effectuez le test proposé et choisissez le résultat.',`<div class="diagnostic-card">
      <div class="diag-path">${esc(state.category)} / ${esc(state.subcategory)} / ${esc(state.brand)} / ÉTAPE ${state.step+1}</div>
      <h3 class="diag-question">${esc(step.q)}</h3>
      <p class="diag-hint">Choisissez la réponse qui correspond le mieux à ce que vous observez sur l’appareil.</p>
      <div class="choices"><button class="choice good" data-choice="yes">Oui / c’est le cas</button><button class="choice bad" data-choice="no">Non / ce n’est pas le cas</button></div>
      <div class="action-box"><div class="action-label">TEST / ACTION CONSEILLÉE</div><div>${esc(step.yes)}</div></div>
      <div class="diag-controls"><button class="mini-btn" id="diag-back">← Étape précédente</button><button class="mini-btn" id="diag-restart">Recommencer ce diagnostic</button><a class="cta-wa" href="https://wa.me/${WA}?text=${encodeURIComponent('Bonjour 27sys, j’utilise votre arbre de diagnostic. Je suis bloqué sur : '+flow.title)}" target="_blank" rel="noopener">Parler à 27sys ↗</a></div>
      <div class="source-box" style="margin-top:18px"><div class="source-title">SOURCE</div><p>${esc(flow.source)}</p></div>
    </div>`,4);
    $$('.choice').forEach(btn=>btn.addEventListener('click',()=>handleChoice(btn.dataset.choice,flow)));
    $('#diag-back').addEventListener('click',()=>{if(state.step>0){state.step--;state.answers.pop();renderDiagnostic();}else{renderProblems(db.categories.find(c=>c.id===state.category).subcategories.find(s=>s.id===state.subcategory));}scrollTree();});
    $('#diag-restart').addEventListener('click',()=>{state.step=0;state.answers=[];renderDiagnostic();scrollTree();});
  }

  function handleChoice(choice,flow){
    const step=flow.steps[state.step];
    const message=step[choice]||'';
    state.answers.push({question:step.q,choice:choice==='yes'?'Oui':'Non',action:message});
    state.step+=1;
    if(state.step>=flow.steps.length){
      const final=message||'Le diagnostic arrive à son terme. Si le problème persiste, 27sys peut prendre le relais.';
      renderResult(flow,final);
      return;
    }
    state.step=Math.min(state.step,flow.steps.length-1);renderDiagnostic();
    const actionBox=document.querySelector('.action-box');if(actionBox)actionBox.innerHTML=`<div class="action-label">PROCHAINE BRANCHE</div><div>${esc(message)}</div>`;
    scrollTree();
  }

  function reportText(flow,final){
    const answerLines=state.answers.slice(-8).map((a,i)=>`${i+1}. ${a.question} → ${a.choice}`).join('\n');
    return `RAPPORT DE DIAGNOSTIC 27SYS\n\nÉquipement : ${state.category}\nType : ${state.subcategory}\nMarque / modèle : ${state.brand}\nProblème : ${flow.title}\n\nParcours :\n${answerLines||'Aucune réponse enregistrée'}\n\nRésultat :\n${final}\n\nSource : ${flow.source}\n\nRapport généré sur 27sys — Assistance N1 gratuite.`;
  }

  function renderResult(flow,final){
    setView(flow.title,'Diagnostic terminé. Voici un rapport récapitulatif que vous pouvez conserver ou transmettre à 27sys.',`<div class="diagnostic-card report-card">
      <div class="report-head"><div><div class="action-label">RAPPORT DE DIAGNOSTIC</div><h3>Parcours terminé</h3></div><span class="report-badge">N1 / GRATUIT</span></div>
      <div class="report-meta"><div><span>Équipement</span><strong>${esc(state.category)}</strong></div><div><span>Type</span><strong>${esc(state.subcategory)}</strong></div><div><span>Marque</span><strong>${esc(state.brand)}</strong></div></div>
      <div class="action-box"><div class="action-label">RÉSULTAT</div>${esc(final)}</div>
      <div class="report-preview"><div class="action-label">RÉSUMÉ</div>${state.answers.slice(-6).map((a,i)=>`<div class="report-line"><b>${i+1}</b><span>${esc(a.question)}</span><em>${esc(a.choice)}</em></div>`).join('')}</div>
      <div class="report-actions"><button class="mini-btn" id="copy-report">Copier le rapport</button><button class="mini-btn" id="print-report">Imprimer / PDF</button><a class="cta-wa" id="report-wa" href="#" target="_blank" rel="noopener">Envoyer le rapport sur WhatsApp ↗</a></div>
      <div class="report-note">Le bouton WhatsApp ouvre une conversation avec le rapport déjà préparé dans le message. Sur mobile, WhatsApp peut s’ouvrir directement ; sur ordinateur, WhatsApp Web peut prendre le relais.</div>
      <div class="source-box" style="margin-top:18px"><div class="source-title">SOURCE</div><p>${esc(flow.source)}</p></div>
      <div class="diag-controls"><button class="mini-btn" id="finish-reset">Choisir un autre problème</button></div>
    </div>`,4);
    const text=reportText(flow,final);
    $('#copy-report').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(text);$('#copy-report').textContent='Rapport copié ✓';}catch{window.prompt('Copiez le rapport ci-dessous :',text);}});
    $('#print-report').addEventListener('click',()=>window.print());
    $('#report-wa').href=`https://wa.me/${WA}?text=${encodeURIComponent('Bonjour 27sys, voici mon rapport de diagnostic :\n\n'+text)}`;
    $('#finish-reset').addEventListener('click',()=>{state.problem=null;state.step=0;state.answers=[];state.trail=state.trail.slice(0,3);const sub=db.categories.find(c=>c.id===state.category).subcategories.find(s=>s.id===state.subcategory);renderProblems(sub);scrollTree();});
  }

  function goBack(){
    if(state.problem){state.problem=null;state.step=0;state.answers=[];state.trail=state.trail.slice(0,3);const cat=db.categories.find(c=>c.id===state.category);renderProblems(cat.subcategories.find(s=>s.id===state.subcategory));return;}
    if(state.brand){state.brand=null;state.trail=state.trail.slice(0,2);const cat=db.categories.find(c=>c.id===state.category);renderBrands(cat.subcategories.find(s=>s.id===state.subcategory));return;}
    if(state.subcategory){state.subcategory=null;state.trail=state.trail.slice(0,1);const cat=db.categories.find(c=>c.id===state.category);renderSubcategories(cat);return;}
    renderHome();renderCategories();
  }

  function scrollTree(){$('#tree').scrollIntoView({behavior:'smooth',block:'start'});}
  $('#back-btn').addEventListener('click',()=>{goBack();scrollTree()});
  $('#reset-btn').addEventListener('click',()=>{renderHome();renderCategories();scrollTree()});
  $('#close-btn').addEventListener('click',()=>{renderHome();renderCategories();scrollTree()});
  load().catch(err=>{console.error(err);$('#view').innerHTML='<div class="tree-empty">Impossible de charger l’arbre de diagnostic. Rechargez la page. Si le problème persiste, contactez 27sys sur WhatsApp.</div>';});
})();
