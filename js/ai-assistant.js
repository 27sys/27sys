/*
 * 27SYS AI ASSISTANT
 * Generative browser-side assistant using Transformers.js + Qwen2.5-1.5B-Instruct.
 * No API key and no paid API required.
 */
(() => {
  'use strict';

  const WA_NUMBER = '212640008930';
  const MODEL = 'onnx-community/Qwen2.5-1.5B-Instruct';
  const TRANSFORMERS_URL = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';
  const MODEL_VERSION = '27sys-4';
  const MAX_NEW_TOKENS = 90;
  const MODEL_TIMEOUT_MS = 30000;

  let generator = null;
  let loadingPromise = null;
  const history = [];

  const SYSTEM = `Tu es 27sys Assistant, l'assistant de dépannage gratuit de 27sys Services à Casablanca.
Tu es une IA conversationnelle de premier niveau pour ordinateur, téléphone, tablette, TV et imprimante.

COMPRÉHENSION :
- Comprends le français naturel, les fautes, les abréviations, le langage familier et les phrases très courtes.
- Par exemple, « mon pc capte le wifi mais ya pas internet » signifie que le PC est connecté au Wi-Fi mais n'a probablement pas accès à Internet.
- Ne demande pas au client de reformuler s'il est possible de comprendre son intention.

STYLE :
- Réponds en français simple et naturel.
- Maximum 2 ou 3 phrases courtes par réponse.
- Pose UNE seule question à la fois.
- Ne donne jamais une longue liste d'étapes.
- Donne d'abord l'étape la plus simple et la plus sûre, puis attends le résultat.
- Ne parle jamais comme un manuel technique.
- Ne répète pas inutilement les mots du client.

MÉTHODE :
1. Comprendre l'appareil et le symptôme à partir de ce que le client écrit.
2. Si quelque chose d'important manque, poser une seule question.
3. Proposer une seule vérification ou action simple.
4. Demander le résultat.
5. Continuer progressivement selon la réponse.
6. Après plusieurs essais sans résultat, proposer de contacter 27sys.

SÉCURITÉ :
- Ne conseille jamais d'ouvrir un appareil, de toucher au secteur, de réparer une alimentation, de manipuler une batterie gonflée, de supprimer des données, de contourner un mot de passe, de flasher un firmware ou d'installer un logiciel douteux.
- En cas de fumée, odeur de brûlé, liquide, batterie gonflée, étincelles, choc électrique ou risque de perte de données : arrêter le dépannage et recommander de ne plus utiliser l'appareil et de contacter 27sys.
- Ne demande jamais de mot de passe, PIN, code bancaire ou donnée secrète.
- Ne prétends jamais avoir effectué une action à distance.
- Ne donne pas de fausse certitude.

IMPORTANT :
- Si le client dit clairement que le problème est résolu, réponds brièvement et termine.
- Si le problème semble matériel ou complexe, dis simplement que 27sys peut prendre le relais.`;

  const css = `
  #ai27-launcher{position:fixed;right:24px;bottom:24px;z-index:10001;border:1px solid rgba(21,24,28,.14);background:#15181c;color:#fff;border-radius:16px;padding:14px 16px;display:flex;align-items:center;gap:12px;font-family:Inter,Arial,sans-serif;font-size:13px;font-weight:600;box-shadow:0 18px 44px rgba(0,0,0,.22);cursor:pointer;transition:transform .25s ease,box-shadow .25s ease,background .25s ease,opacity .25s ease;opacity:0;transform:translateY(18px);pointer-events:none;max-width:330px;text-align:left}
  #ai27-launcher.ai27-visible{opacity:1;transform:translateY(0);pointer-events:auto}
  #ai27-launcher:hover{transform:translateY(-3px);background:#1677ff;box-shadow:0 24px 54px rgba(0,0,0,.28)}
  #ai27-launcher .ai27-avatar{width:38px;height:38px;min-width:38px;border:1px solid rgba(255,255,255,.22);display:grid;place-items:center;font:700 13px/1 Inter,Arial,sans-serif;background:rgba(255,255,255,.05)}
  #ai27-launcher .ai27-invite{display:flex;flex-direction:column;gap:3px}.ai27-invite strong{font:700 13px/1.2 'Space Grotesk',Arial,sans-serif}.ai27-invite span{font:10px/1.3 Inter,Arial,sans-serif;color:rgba(255,255,255,.68)}
  #ai27-launcher .ai27-dismiss{margin-left:auto;width:24px;height:24px;border:0;background:transparent;color:rgba(255,255,255,.62);font-size:18px;line-height:1;cursor:pointer;padding:0}
  #ai27{position:fixed;right:24px;bottom:24px;width:min(430px,calc(100vw - 32px));height:min(680px,calc(100vh - 48px));z-index:10002;background:#f4f3ee;color:#15181c;border:1px solid rgba(21,24,28,.14);box-shadow:0 30px 90px rgba(0,0,0,.28);display:none;flex-direction:column;overflow:hidden}
  #ai27.open{display:flex}
  .ai27-head{background:#15181c;color:#f4f3ee;padding:17px 18px;display:flex;justify-content:space-between;align-items:center}.ai27-brand{display:flex;gap:11px;align-items:center}.ai27-mark{width:34px;height:34px;border:1px solid rgba(255,255,255,.25);display:grid;place-items:center;font:700 13px Inter,Arial,sans-serif}.ai27-brand strong{display:block;font:700 15px/1 'Space Grotesk',Arial,sans-serif}.ai27-brand small{display:block;margin-top:5px;color:rgba(255,255,255,.58);font:10px/1 'JetBrains Mono',monospace;letter-spacing:.08em;text-transform:uppercase}.ai27-head .ai27-close{border:0;background:none;color:#fff;font-size:22px;cursor:pointer;padding:4px}
  .ai27-body{flex:1;overflow:auto;padding:16px;background:linear-gradient(180deg,#f4f3ee 0%,#ebeae5 100%)}.ai27-msg{max-width:90%;padding:12px 14px;border:1px solid rgba(21,24,28,.11);background:#fff;margin:0 0 12px;font:13px/1.55 Inter,Arial,sans-serif;box-shadow:0 6px 16px rgba(21,24,28,.05);white-space:pre-wrap}.ai27-msg.bot:before{content:'27sys Assistant';display:block;font:10px/1 'JetBrains Mono',monospace;color:#1677ff;letter-spacing:.08em;text-transform:uppercase;margin-bottom:7px}.ai27-msg.user{margin-left:auto;background:#15181c;color:#fff;border-color:#15181c}.ai27-loading{font:10px/1.4 'JetBrains Mono',monospace;color:#71747a;margin:4px 0 12px;text-transform:uppercase;letter-spacing:.08em}
  .ai27-foot{border-top:1px solid rgba(21,24,28,.12);padding:10px 12px;background:#f4f3ee}.ai27-compose{display:flex;gap:8px}.ai27-input{flex:1;min-width:0;border:1px solid #c8c7c1;background:#fff;padding:11px 12px;outline:none;font:13px Inter,Arial,sans-serif}.ai27-input:focus{border-color:#1677ff}.ai27-send{border:1px solid #15181c;background:#15181c;color:#fff;padding:0 15px;font:600 12px Inter,Arial,sans-serif;cursor:pointer}.ai27-send:disabled{opacity:.5;cursor:default}.ai27-actions{display:flex;gap:8px;margin-top:8px}.ai27-action{flex:1;text-align:center;padding:9px;border:1px solid #15181c;text-decoration:none;font:600 11px Inter,Arial,sans-serif}.ai27-wa{background:#15181c;color:#fff}.ai27-reset{background:#fff;color:#15181c;cursor:pointer}.ai27-note{font:9px/1.4 Inter,Arial,sans-serif;color:#73757a;text-align:center;margin-top:8px}
  .ai27-welcome{padding:10px 12px;margin-bottom:10px;background:rgba(22,119,255,.06);border-left:2px solid #1677ff;font:11px/1.5 Inter,Arial,sans-serif;color:#45484d}.ai27-status{font:10px/1.4 Inter,Arial,sans-serif;color:#73757a;margin-top:8px;text-align:center}
  @media(max-width:600px){#ai27-launcher{right:14px;bottom:14px;max-width:calc(100vw - 28px);padding:12px 13px}#ai27-launcher .ai27-avatar{width:34px;height:34px;min-width:34px}#ai27{right:8px;bottom:8px;width:calc(100vw - 16px);height:calc(100vh - 16px)}}`;

  const style = document.createElement('style');
  style.id = 'ai27-style';
  style.textContent = css;
  document.head.appendChild(style);

  const launcher = document.createElement('button');
  launcher.id = 'ai27-launcher';
  launcher.type = 'button';
  launcher.setAttribute('aria-label', 'Ouvrir l’assistance virtuelle gratuite 27sys');
  launcher.innerHTML = '<span class="ai27-avatar">27</span><span class="ai27-invite"><strong>Assistance Virtuelle Gratuite</strong><span>Un problème informatique ? Je peux vous guider.</span></span><span class="ai27-dismiss" aria-hidden="true">×</span>';
  document.body.appendChild(launcher);

  const app = document.createElement('section');
  app.id = 'ai27';
  app.setAttribute('aria-label', '27sys Assistant IA de dépannage');
  app.innerHTML = `
    <div class="ai27-head"><div class="ai27-brand"><div class="ai27-mark">27</div><div><strong>27sys Assistant</strong><small>IA générative • dépannage</small></div></div><button class="ai27-close" type="button" aria-label="Fermer">×</button></div>
    <div class="ai27-body" id="ai27-chat"><div class="ai27-welcome">Bonjour 👋 Décrivez votre problème comme vous le feriez avec un technicien. Je peux vous aider pour un ordinateur, téléphone, tablette, TV ou imprimante.</div></div>
    <div class="ai27-foot"><div class="ai27-compose"><input id="ai27-input" class="ai27-input" type="text" placeholder="Ex. mon pc capte le wifi mais pas internet" autocomplete="off"><button id="ai27-send" class="ai27-send" type="button">Envoyer</button></div><div class="ai27-actions"><a id="ai27-wa" class="ai27-action ai27-wa" target="_blank" rel="noopener">Contacter 27sys</a><button id="ai27-reset" class="ai27-action ai27-reset" type="button">Recommencer</button></div><div class="ai27-note">IA de premier niveau. Aucun mot de passe ou donnée sensible.</div></div>`;
  document.body.appendChild(app);

  const chat = document.getElementById('ai27-chat');
  const input = document.getElementById('ai27-input');
  const send = document.getElementById('ai27-send');
  const wa = document.getElementById('ai27-wa');
  const loading = document.createElement('div');
  loading.className = 'ai27-loading';
  loading.textContent = 'Préparation de l’IA…';
  loading.style.display = 'none';
  app.querySelector('.ai27-body').appendChild(loading);

  function scroll(){ chat.scrollTop = chat.scrollHeight; }
  function add(text, user=false){ const d=document.createElement('div'); d.className='ai27-msg '+(user?'user':'bot'); d.textContent=text; chat.insertBefore(d,loading); scroll(); }
  function setWA(){
    const subject = history.filter(x=>x.role==='user').slice(-2).map(x=>x.content).join(' / ');
    const msg = `Bonjour 27sys, j'ai utilisé le 27sys Assistant. Mon problème est : ${subject || 'j’ai besoin d’une aide informatique'}. Le dépannage de base n’a pas suffi.`;
    wa.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  }
  function fallbackAnswer(text){
    const q = text.toLowerCase();
    if (/(wifi|wi-fi|internet|connexion|réseau)/i.test(q)) return 'D’accord. Est-ce qu’un autre appareil connecté au même Wi‑Fi a Internet ?';
    if (/(lent|ralenti|slow)/i.test(q) && /(pc|ordinateur|laptop)/i.test(q)) return 'Sur le PC, ouvre le Gestionnaire des tâches avec Ctrl + Shift + Échap. Dis-moi si le CPU, la mémoire ou le disque est proche de 100 %.';
    if (/(écran noir|black screen|pas d'image)/i.test(q)) return 'Est-ce que le PC démarre normalement : ventilateurs, voyants ou sons ?';
    if (/(imprimante|printer)/i.test(q)) return 'L’imprimante est-elle allumée et indiquée comme « hors ligne » sur le PC ?';
    if (/(tv|télé)/i.test(q)) return 'Quel est le problème principal de la TV : Wi‑Fi, HDMI, son, image ou application ?';
    return 'Je peux vous aider. Quel appareil pose problème et qu’est-ce qui se passe exactement ?';
  }
  function extractAnswer(output){
    const generated = output?.[0]?.generated_text;
    if(Array.isArray(generated)){ const last = generated[generated.length - 1]; if(last?.content) return String(last.content).trim(); }
    if(typeof generated === 'string') return generated.trim();
    return '';
  }
  async function loadModel(){
    if(generator) return generator;
    if(loadingPromise) return loadingPromise;
    loadingPromise = (async()=>{
      const mod = await import(`${TRANSFORMERS_URL}?v=${MODEL_VERSION}`);
      const preferred = ('gpu' in navigator) ? 'webgpu' : 'wasm';
      try{ generator = await mod.pipeline('text-generation', MODEL, {dtype:'q4', device:preferred}); }
      catch(err){ generator = await mod.pipeline('text-generation', MODEL, {dtype:'q4', device:'wasm'}); }
      return generator;
    })();
    return loadingPromise;
  }
  async function ask(){
    const text = input.value.trim();
    if(!text || send.disabled) return;
    input.value=''; add(text,true); history.push({role:'user',content:text}); setWA();
    send.disabled=true; loading.style.display='block'; loading.textContent='Chargement de l’IA…'; scroll();
    try{
      const gen = await Promise.race([loadModel(), new Promise((_,reject)=>setTimeout(()=>reject(new Error('AI_TIMEOUT')),MODEL_TIMEOUT_MS))]);
      loading.textContent='Génération…';
      const recent = history.slice(-8);
      const messages = [{role:'system',content:SYSTEM}, ...recent];
      const out = await gen(messages,{max_new_tokens:MAX_NEW_TOKENS,do_sample:true,temperature:0.3,top_p:0.8,repetition_penalty:1.1});
      const answer = extractAnswer(out) || fallbackAnswer(text);
      add(answer,false); history.push({role:'assistant',content:answer}); setWA();
    }catch(err){
      const answer = fallbackAnswer(text);
      add(answer,false); history.push({role:'assistant',content:answer}); setWA();
    }finally{
      loading.style.display='none'; send.disabled=false; input.focus(); scroll();
    }
  }
  function reset(){
    history.length=0;
    chat.innerHTML='<div class="ai27-welcome">Bonjour 👋 Décrivez votre problème comme vous le feriez avec un technicien. Je peux vous aider pour un ordinateur, téléphone, tablette, TV ou imprimante.</div>';
    chat.appendChild(loading); loading.style.display='none'; setWA();
  }
  function openAssistant(){ app.classList.add('open'); launcher.classList.remove('ai27-visible'); input.focus(); }
  function showInvitation(){ if(!app.classList.contains('open') && !sessionStorage.getItem('ai27-invite-dismissed')) window.setTimeout(()=>launcher.classList.add('ai27-visible'),1800); }

  launcher.addEventListener('click',(event)=>{
    if(event.target && event.target.classList.contains('ai27-dismiss')){ event.stopPropagation(); launcher.classList.remove('ai27-visible'); sessionStorage.setItem('ai27-invite-dismissed','1'); return; }
    openAssistant();
  });
  app.querySelector('.ai27-head .ai27-close').addEventListener('click',()=>app.classList.remove('open'));
  send.addEventListener('click',ask);
  input.addEventListener('keydown',e=>{ if(e.key==='Enter') ask(); });
  document.getElementById('ai27-reset').addEventListener('click',reset);
  setWA();
  showInvitation();
})();
