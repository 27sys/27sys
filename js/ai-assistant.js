/*
 * 27SYS AI ASSISTANT
 * Browser-side LLM using Transformers.js + Qwen2.5-0.5B-Instruct.
 * No API key, no paid API and no server required.
 */
import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';

(() => {
  'use strict';

  const WA_NUMBER = '212640008930';
  const MODEL = 'onnx-community/Qwen2.5-0.5B-Instruct';
  let generator = null;
  let loadingPromise = null;
  const history = [];

  const SYSTEM = `Tu es « 27sys Assistant », l’assistant gratuit de premier niveau de 27sys Services à Casablanca.
Tu réponds uniquement en français, avec des phrases courtes, simples et professionnelles.
Ton rôle est de guider un particulier ou une petite entreprise dans un dépannage de base pour ordinateur, téléphone, tablette, TV ou imprimante.
Tu dois poser UNE question simple à la fois avant de proposer une procédure lorsque le problème n’est pas encore clair.
Ne donne que des manipulations réversibles et à faible risque : redémarrer, vérifier un câble, vérifier un réglage, reconnecter un réseau, vérifier une file d’impression, libérer un peu d’espace, vérifier les mises à jour, tester un autre câble/port/appareil.
Ne conseille jamais d’ouvrir un appareil, de toucher au secteur, de manipuler une batterie gonflée, de faire une réparation électrique, de flasher un firmware, de contourner un mot de passe, de supprimer des données, de réinitialiser un appareil ou d’installer un logiciel douteux sans validation humaine.
Si le client signale fumée, odeur de brûlé, chaleur anormale, liquide, batterie gonflée, étincelles, choc électrique ou risque de perte de données, arrête immédiatement le dépannage et recommande de ne plus utiliser l’appareil et de contacter 27sys.
Ne prétends jamais avoir effectué une action à distance et ne prétends jamais connaître le modèle exact si le client ne l’a pas donné.
Ne demande jamais de mot de passe, code PIN, code de carte, donnée bancaire ou autre secret.
Après quelques étapes infructueuses, reconnais que le problème nécessite probablement un diagnostic humain et propose le bouton WhatsApp 27sys.
Ne donne pas de fausse certitude. Dis clairement « probablement » ou « à vérifier » quand nécessaire.`;

  const css = `
  #ai27-hero-cta{display:inline-flex;align-items:center;gap:9px;margin-top:10px;background:#1677ff;color:#fff;border-color:#1677ff;box-shadow:0 10px 28px rgba(22,119,255,.22);font-weight:600}
  #ai27-hero-cta:hover{background:#0f63d7;color:#fff;border-color:#0f63d7;transform:translateY(-1px)}
  #ai27-hero-cta .ai27-cta-dot{width:7px;height:7px;border-radius:50%;background:#ff8b5c;box-shadow:0 0 0 4px rgba(255,139,92,.13)}
  #ai27-launcher{position:fixed;right:24px;bottom:24px;z-index:10001;border:1px solid rgba(255,255,255,.18);background:#15181c;color:#f4f3ee;border-radius:999px;padding:14px 18px;display:flex;align-items:center;gap:10px;font-family:Inter,Arial,sans-serif;font-size:13px;font-weight:600;box-shadow:0 16px 40px rgba(0,0,0,.25);cursor:pointer;transition:.2s ease}
  #ai27-launcher:hover{transform:translateY(-2px);background:#1677ff;box-shadow:0 20px 46px rgba(0,0,0,.3)}
  #ai27-launcher .dot{width:9px;height:9px;border-radius:50%;background:#ff7a45;box-shadow:0 0 0 4px rgba(255,122,69,.16)}
  #ai27{position:fixed;right:24px;bottom:86px;width:min(430px,calc(100vw - 32px));height:min(680px,calc(100vh - 120px));z-index:10002;background:#f4f3ee;color:#15181c;border:1px solid rgba(21,24,28,.14);box-shadow:0 30px 90px rgba(0,0,0,.28);display:none;flex-direction:column;overflow:hidden}
  #ai27.open{display:flex}
  .ai27-head{background:#15181c;color:#f4f3ee;padding:17px 18px;display:flex;justify-content:space-between;align-items:center}.ai27-brand{display:flex;gap:11px;align-items:center}.ai27-mark{width:34px;height:34px;border:1px solid rgba(255,255,255,.25);display:grid;place-items:center;font:700 13px Inter,Arial,sans-serif}.ai27-brand strong{display:block;font:700 15px/1 'Space Grotesk',Arial,sans-serif}.ai27-brand small{display:block;margin-top:5px;color:rgba(255,255,255,.58);font:10px/1 'JetBrains Mono',monospace;letter-spacing:.08em;text-transform:uppercase}.ai27-close{border:0;background:none;color:#fff;font-size:22px;cursor:pointer;padding:4px}
  .ai27-body{flex:1;overflow:auto;padding:16px;background:linear-gradient(180deg,#f4f3ee 0%,#ebeae5 100%)}.ai27-msg{max-width:90%;padding:12px 14px;border:1px solid rgba(21,24,28,.11);background:#fff;margin:0 0 12px;font:13px/1.55 Inter,Arial,sans-serif;box-shadow:0 6px 16px rgba(21,24,28,.05);white-space:pre-wrap}.ai27-msg.bot:before{content:'27sys Assistant';display:block;font:10px/1 'JetBrains Mono',monospace;color:#1677ff;letter-spacing:.08em;text-transform:uppercase;margin-bottom:7px}.ai27-msg.user{margin-left:auto;background:#15181c;color:#fff;border-color:#15181c}.ai27-loading{font:10px/1.4 'JetBrains Mono',monospace;color:#71747a;margin:4px 0 12px;text-transform:uppercase;letter-spacing:.08em}
  .ai27-foot{border-top:1px solid rgba(21,24,28,.12);padding:10px 12px;background:#f4f3ee}.ai27-compose{display:flex;gap:8px}.ai27-input{flex:1;min-width:0;border:1px solid #c8c7c1;background:#fff;padding:11px 12px;outline:none;font:13px Inter,Arial,sans-serif}.ai27-input:focus{border-color:#1677ff}.ai27-send{border:1px solid #15181c;background:#15181c;color:#fff;padding:0 15px;font:600 12px Inter,Arial,sans-serif;cursor:pointer}.ai27-send:disabled{opacity:.5;cursor:default}.ai27-actions{display:flex;gap:8px;margin-top:8px}.ai27-action{flex:1;text-align:center;padding:9px;border:1px solid #15181c;text-decoration:none;font:600 11px Inter,Arial,sans-serif}.ai27-wa{background:#15181c;color:#fff}.ai27-reset{background:#fff;color:#15181c;cursor:pointer}.ai27-note{font:9px/1.4 Inter,Arial,sans-serif;color:#73757a;text-align:center;margin-top:8px}
  .ai27-welcome{padding:10px 12px;margin-bottom:10px;background:rgba(22,119,255,.06);border-left:2px solid #1677ff;font:11px/1.5 Inter,Arial,sans-serif;color:#45484d}
  @media(max-width:600px){#ai27-hero-cta{width:100%;justify-content:center;margin-top:8px}#ai27-launcher{right:16px;bottom:16px;padding:13px 15px}#ai27{right:8px;bottom:76px;width:calc(100vw - 16px);height:calc(100vh - 96px)}}`;

  const style = document.createElement('style');
  style.id = 'ai27-style';
  style.textContent = css;
  document.head.appendChild(style);

  const heroCtas = document.querySelector('.hero-ctas');
  const heroCta = document.createElement('button');
  heroCta.id = 'ai27-hero-cta';
  heroCta.type = 'button';
  heroCta.className = 'btn';
  heroCta.innerHTML = '<span class="ai27-cta-dot"></span> Assistance Virtuelle Gratuite <span aria-hidden="true">↗</span>';
  if (heroCtas) heroCtas.appendChild(heroCta);

  const launcher = document.createElement('button');
  launcher.id = 'ai27-launcher';
  launcher.type = 'button';
  launcher.innerHTML = '<span class="dot"></span> Assistant 27sys';
  document.body.appendChild(launcher);

  const app = document.createElement('section');
  app.id = 'ai27';
  app.setAttribute('aria-label', '27sys Assistant IA de dépannage');
  app.innerHTML = `
    <div class="ai27-head"><div class="ai27-brand"><div class="ai27-mark">27</div><div><strong>27sys Assistant</strong><small>IA • dépannage de premier niveau</small></div></div><button class="ai27-close" type="button" aria-label="Fermer">×</button></div>
    <div class="ai27-body" id="ai27-chat"><div class="ai27-welcome">Bonjour 👋 Décrivez simplement votre problème. Je peux vous guider pour un dépannage de base sur un ordinateur, téléphone, tablette, TV ou imprimante.</div></div>
    <div class="ai27-foot"><div class="ai27-compose"><input id="ai27-input" class="ai27-input" type="text" placeholder="Ex. Mon PC n'a plus Internet..." autocomplete="off"><button id="ai27-send" class="ai27-send" type="button">Envoyer</button></div><div class="ai27-actions"><a id="ai27-wa" class="ai27-action ai27-wa" target="_blank" rel="noopener">Contacter 27sys</a><button id="ai27-reset" class="ai27-action ai27-reset" type="button">Recommencer</button></div><div class="ai27-note">Premier niveau uniquement. Aucun mot de passe ou donnée sensible ne doit être communiqué.</div></div>`;
  document.body.appendChild(app);

  const chat = document.getElementById('ai27-chat');
  const input = document.getElementById('ai27-input');
  const send = document.getElementById('ai27-send');
  const wa = document.getElementById('ai27-wa');
  const loading = document.createElement('div');
  loading.className = 'ai27-loading';
  loading.textContent = 'Préparation de l’assistant IA…';
  loading.style.display = 'none';
  app.querySelector('.ai27-body').appendChild(loading);

  function scroll(){ chat.scrollTop = chat.scrollHeight; }
  function add(text, user=false){ const d=document.createElement('div'); d.className='ai27-msg '+(user?'user':'bot'); d.textContent=text; chat.insertBefore(d,loading); scroll(); }
  function setWA(){
    const subject = history.filter(x=>x.role==='user').slice(-2).map(x=>x.content).join(' / ');
    const msg = `Bonjour 27sys, j'ai utilisé le 27sys Assistant. Mon problème est : ${subject || 'j’ai besoin d’une aide informatique'}. Le dépannage de base n’a pas suffi.`;
    wa.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  }

  async function loadModel(){
    if(generator) return generator;
    if(loadingPromise) return loadingPromise;
    loadingPromise = (async()=>{
      const preferred = ('gpu' in navigator) ? 'webgpu' : 'wasm';
      try{
        generator = await pipeline('text-generation', MODEL, { dtype:'q4', device:preferred });
      }catch(err){
        generator = await pipeline('text-generation', MODEL, { dtype:'q4', device:'wasm' });
      }
      return generator;
    })();
    return loadingPromise;
  }

  async function ask(){
    const text = input.value.trim();
    if(!text || send.disabled) return;
    input.value=''; add(text,true); history.push({role:'user',content:text}); setWA();
    send.disabled=true; loading.style.display='block'; loading.textContent='Chargement / génération de la réponse…'; scroll();
    try{
      const gen = await loadModel();
      const recent = history.slice(-8);
      const messages = [
        {role:'system',content:SYSTEM},
        ...recent
      ];
      const out = await gen(messages,{max_new_tokens:180, do_sample:true, temperature:0.25, top_p:0.9});
      const generated = out?.[0]?.generated_text;
      let answer = generated?.[generated.length-1]?.content || '';
      if(!answer && typeof generated === 'string') answer = generated;
      answer = String(answer).trim();
      if(!answer) answer = 'Je n’ai pas réussi à générer une réponse. Contactez 27sys pour que je prenne le relais.';
      add(answer,false); history.push({role:'assistant',content:answer}); setWA();
    }catch(err){
      add('Je rencontre un problème avec l’assistant IA dans votre navigateur. Vous pouvez tout de suite contacter 27sys sur WhatsApp.',false);
    }finally{
      loading.style.display='none'; send.disabled=false; input.focus(); scroll();
    }
  }

  function reset(){
    history.length=0;
    chat.innerHTML='<div class="ai27-welcome">Bonjour 👋 Décrivez simplement votre problème. Je peux vous guider pour un dépannage de base sur un ordinateur, téléphone, tablette, TV ou imprimante.</div>';
    chat.appendChild(loading); loading.style.display='none'; setWA();
  }

  function openAssistant(){ app.classList.add('open'); input.focus(); }
  launcher.addEventListener('click',openAssistant);
  heroCta.addEventListener('click',openAssistant);
  app.querySelector('.ai27-close').addEventListener('click',()=>app.classList.remove('open'));
  send.addEventListener('click',ask);
  input.addEventListener('keydown',e=>{ if(e.key==='Enter') ask(); });
  document.getElementById('ai27-reset').addEventListener('click',reset);
  setWA();
})();
