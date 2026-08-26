/*
 * 27sys N1 Virtual Technician
 * Local-first knowledge engine + adaptive learning + rare AI classification fallback.
 * Normal supported cases use zero Gemini calls.
 */
(() => {
  'use strict';

  const LIBRARY_URL = 'knowledge/n1-library.json';
  const CLASSIFIER_URL = 'https://27sys.vercel.app/api/classify';
  const WA_NUMBER = '212640008930';
  const STATE_KEY = '27sys-n1-state-v2';
  const LEARN_KEY = '27sys-n1-learning-v1';

  ['ai27-launcher','ai27','ai27-style','sys-assistant-launcher','sys-assistant','sys-assistant-style']
    .forEach(id => { const e = document.getElementById(id); if (e) e.remove(); });

  const style = document.createElement('style');
  style.id = 'ai27-style';
  style.textContent = `#ai27-launcher{position:fixed;right:24px;bottom:24px;z-index:10001;border:1px solid rgba(21,24,28,.14);background:#15181c;color:#fff;border-radius:16px;padding:14px 16px;display:flex;align-items:center;gap:12px;font:600 13px Inter,Arial,sans-serif;box-shadow:0 18px 44px rgba(0,0,0,.22);cursor:pointer;opacity:0;transform:translateY(16px);pointer-events:none;transition:.25s ease;max-width:340px;text-align:left}#ai27-launcher.visible{opacity:1;transform:translateY(0);pointer-events:auto}#ai27-launcher:hover{transform:translateY(-3px);background:#1677ff}.ai27-avatar{width:38px;height:38px;min-width:38px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.22);font:700 13px Inter,Arial,sans-serif}.ai27-invite{display:flex;flex-direction:column;gap:3px}.ai27-invite strong{font:700 13px 'Space Grotesk',Inter,Arial,sans-serif}.ai27-invite span{color:rgba(255,255,255,.66);font-size:10px}.ai27-dismiss{margin-left:auto;width:24px;height:24px;border:0;background:transparent;color:rgba(255,255,255,.65);font-size:18px;cursor:pointer}#ai27{position:fixed;right:24px;bottom:24px;z-index:10002;width:min(450px,calc(100vw - 32px));height:min(700px,calc(100vh - 40px));display:none;flex-direction:column;overflow:hidden;background:#f4f3ee;color:#15181c;border:1px solid rgba(21,24,28,.13);box-shadow:0 30px 90px rgba(0,0,0,.3)}#ai27.open{display:flex}.ai27-head{display:flex;justify-content:space-between;align-items:center;padding:17px 18px;background:#15181c;color:#fff}.ai27-brand{display:flex;align-items:center;gap:11px}.ai27-mark{width:34px;height:34px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.23);font:700 13px Inter,Arial,sans-serif}.ai27-brand strong{display:block;font:700 15px 'Space Grotesk',Inter,Arial,sans-serif}.ai27-brand small{display:block;margin-top:5px;color:rgba(255,255,255,.58);font:9px 'JetBrains Mono',monospace;letter-spacing:.08em;text-transform:uppercase}.ai27-close{border:0;background:none;color:#fff;font-size:22px;cursor:pointer}.ai27-body{flex:1;overflow:auto;padding:16px;background:linear-gradient(180deg,#f4f3ee,#ebeae5)}.ai27-welcome{padding:11px 13px;margin-bottom:12px;background:rgba(22,119,255,.06);border-left:2px solid #1677ff;font:12px/1.5 Inter,Arial,sans-serif;color:#44484d}.ai27-msg{max-width:90%;margin:0 0 12px;padding:12px 14px;border:1px solid rgba(21,24,28,.1);background:#fff;font:13px/1.55 Inter,Arial,sans-serif;box-shadow:0 6px 16px rgba(21,24,28,.05);white-space:pre-wrap}.ai27-msg.bot:before{content:'27sys N1 Assistant';display:block;margin-bottom:6px;color:#1677ff;font:9px 'JetBrains Mono',monospace;letter-spacing:.08em;text-transform:uppercase}.ai27-msg.user{margin-left:auto;background:#15181c;color:#fff;border-color:#15181c}.ai27-msg.error{border-left:2px solid #ff7a45;background:#fffaf7}.ai27-msg.source{font-size:11px;color:#686d73;background:#fafaf8}.ai27-status{margin:4px 0 12px;color:#7a7d82;font:9px 'JetBrains Mono',monospace;letter-spacing:.06em}.ai27-foot{padding:10px 12px;border-top:1px solid rgba(21,24,28,.12);background:#f4f3ee}.ai27-compose{display:flex;gap:8px}.ai27-input{flex:1;min-width:0;padding:11px 12px;border:1px solid #c8c7c1;background:#fff;outline:0;font:13px Inter,Arial,sans-serif}.ai27-input:focus{border-color:#1677ff}.ai27-send{padding:0 15px;border:1px solid #15181c;background:#15181c;color:#fff;font:600 12px Inter,Arial,sans-serif;cursor:pointer}.ai27-send:disabled{opacity:.5;cursor:default}.ai27-actions{display:flex;gap:8px;margin-top:8px}.ai27-action{flex:1;padding:9px;border:1px solid #15181c;text-align:center;text-decoration:none;font:600 11px Inter,Arial,sans-serif}.ai27-wa{background:#15181c;color:#fff}.ai27-reset{background:#fff;color:#15181c;cursor:pointer}.ai27-note{margin-top:7px;text-align:center;color:#777;font:9px/1.4 Inter,Arial,sans-serif}@media(max-width:600px){#ai27-launcher{right:14px;bottom:14px;max-width:calc(100vw - 28px);padding:12px 13px}#ai27{right:8px;bottom:8px;width:calc(100vw - 16px);height:calc(100vh - 16px)}}`;
  document.head.appendChild(style);

  const launcher = document.createElement('button');
  launcher.id = 'ai27-launcher';
  launcher.type = 'button';
  launcher.innerHTML = '<span class="ai27-avatar">27</span><span class="ai27-invite"><strong>Assistance Virtuelle Gratuite</strong><span>N1 local • IA seulement si nécessaire</span></span><span class="ai27-dismiss">×</span>';
  document.body.appendChild(launcher);

  const app = document.createElement('section');
  app.id = 'ai27';
  app.setAttribute('aria-label', '27sys Assistant N1');
  app.innerHTML = '<div class="ai27-head"><div class="ai27-brand"><div class="ai27-mark">27</div><div><strong>27sys Assistant</strong><small>HELPDESK N1 • BASE TECHNIQUE</small></div></div><button class="ai27-close" type="button" aria-label="Fermer">×</button></div><div class="ai27-body" id="ai27-chat"><div class="ai27-welcome">Bonjour 👋 Décrivez simplement votre problème. Je cherche d’abord dans ma bibliothèque N1 et n’utilise l’IA que lorsque le cas est ambigu ou nouveau.</div></div><div class="ai27-foot"><div class="ai27-compose"><input id="ai27-input" class="ai27-input" type="text" placeholder="Ex. mon pc est connecté au wifi mais pas internet" autocomplete="off"><button id="ai27-send" class="ai27-send" type="button">Envoyer</button></div><div class="ai27-actions"><a id="ai27-wa" class="ai27-action ai27-wa" target="_blank" rel="noopener">Contacter 27sys</a><button id="ai27-reset" class="ai27-action ai27-reset" type="button">Nouvelle conversation</button></div><div class="ai27-note">Bibliothèque technique d’abord • aucune clé API pour les cas connus.</div></div>';
  document.body.appendChild(app);

  const chat = document.getElementById('ai27-chat');
  const input = document.getElementById('ai27-input');
  const send = document.getElementById('ai27-send');
  const wa = document.getElementById('ai27-wa');
  const loading = document.createElement('div');
  loading.className = 'ai27-status';
  loading.style.display = 'none';
  chat.appendChild(loading);

  let library = null;
  let state = { flowId: null, step: null, initialText: null, candidateFlowId: null };
  let learning = { aliases: {}, stats: {}, candidates: {} };

  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,' ').replace(/[^a-z0-9\s/+-]/g,' ').replace(/\s+/g,' ').trim();
  const scroll = () => { chat.scrollTop = chat.scrollHeight; };

  function loadPersistence() {
    try {
      const s = JSON.parse(sessionStorage.getItem(STATE_KEY) || 'null');
      if (s && typeof s === 'object') state = { ...state, ...s };
    } catch {}
    try {
      const l = JSON.parse(localStorage.getItem(LEARN_KEY) || 'null');
      if (l && typeof l === 'object') learning = { ...learning, ...l };
    } catch {}
  }

  function saveState() { try { sessionStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch {} }
  function saveLearning() { try { localStorage.setItem(LEARN_KEY, JSON.stringify(learning)); } catch {} }

  const add = (text, user = false, error = false, source = false) => {
    const e = document.createElement('div');
    e.className = `ai27-msg ${user ? 'user' : 'bot'}${error ? ' error' : ''}${source ? ' source' : ''}`;
    e.textContent = text;
    chat.insertBefore(e, loading);
    scroll();
    return e;
  };

  const loadingState = (on, text = 'Analyse N1…') => { loading.style.display = on ? 'block' : 'none'; if (on) loading.textContent = text; scroll(); };

  const setWA = () => {
    const q = Array.from(chat.querySelectorAll('.ai27-msg.user')).slice(-3).map(x => x.textContent).join(' / ') || 'un problème informatique';
    wa.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Bonjour 27sys, j’ai utilisé l’Assistant N1. Mon problème est : ${q}. Le diagnostic n’est pas résolu.`)}`;
  };

  function currentFlow() { return library?.flows?.find(f => f.id === state.flowId) || null; }

  function learnedTerms(flowId) { return Array.isArray(learning.aliases[flowId]) ? learning.aliases[flowId] : []; }

  function keywordScore(flow, text) {
    const t = norm(text);
    let score = 0;
    for (const term of (flow.match || [])) {
      const q = norm(term);
      if (q && t.includes(q)) score += q.includes(' ') ? 3 : 1;
    }
    for (const term of learnedTerms(flow.id)) {
      const q = norm(term);
      if (q && t.includes(q)) score += q.length > 12 ? 6 : 3;
    }
    if (flow.title && t.includes(norm(flow.title))) score += 4;
    if (flow.id.includes('iphone') && /iphone/.test(t)) score += 3;
    if (flow.id.includes('android') && /(android|samsung|xiaomi|redmi|oppo|realme)/.test(t)) score += 3;
    return score;
  }

  function detectFlow(text) {
    const ranked = (library?.flows || []).map(f => ({ f, s: keywordScore(f, text) })).sort((a,b) => b.s - a.s);
    if (!ranked.length || ranked[0].s < 2) return { flow: null, confidence: 0 };
    if (ranked[1] && ranked[0].s === ranked[1].s) return { flow: null, confidence: .45 };
    const confidence = Math.min(.99, ranked[0].s / 10);
    return { flow: ranked[0].f, confidence };
  }

  function answerType(text) {
    const t = norm(text);
    if (/\b(oui|yes|exact|exactement|ca marche|cela marche|marche|fonctionne|ok|c est bon|resolu|regle|oui ca|ça marche)\b/.test(t)) return 'yes';
    if (/\b(non|no|pas|toujours pas|ca marche pas|cela marche pas|ne marche pas|fonctionne pas|rien|toujours rien)\b/.test(t)) return 'no';
    if (/les deux|wifi et.*mobile|mobile et.*wifi/.test(t)) return 'both';
    if (/wifi|wi fi|wireless/.test(t)) return 'wifi';
    if (/4g|5g|lte|donnees mobiles|data mobile|cellulaire/.test(t)) return 'mobile';
    return null;
  }

  function startFlow(flow, initialText) {
    state = { flowId: flow.id, step: 0, initialText: initialText || state.initialText || null, candidateFlowId: null };
    saveState();
    return flow.steps[0]?.say || 'Je n’ai pas d’étape fiable pour ce cas.';
  }

  function nextFromAnswer(flow, text) {
    const step = flow.steps[state.step];
    if (!step) return { message: 'Je préfère arrêter ici plutôt que d’inventer une procédure. 27sys peut prendre le relais.', end: 'escalate' };
    const type = answerType(text);
    const idx = type && step.branch ? step.branch[type] : undefined;
    if (typeof idx !== 'number') return { message: 'Pour continuer correctement, réponds simplement par oui/non, ou précise le résultat de la vérification.', askAgain: true };
    state.step = idx;
    saveState();
    const target = flow.steps[idx];
    if (!target) return { message: 'Je préfère arrêter ici plutôt que d’inventer une procédure. 27sys peut prendre le relais.', end: 'escalate' };
    return { message: target.say, end: target.end };
  }

  function recordCase(flowId, outcome) {
    if (!flowId) return;
    const stats = learning.stats[flowId] || { used: 0, resolved: 0, escalated: 0 };
    stats.used += 1;
    if (outcome === 'resolved') stats.resolved += 1;
    if (outcome === 'escalate') stats.escalated += 1;
    learning.stats[flowId] = stats;

    if (outcome === 'resolved' && state.initialText) {
      const alias = norm(state.initialText);
      const aliases = learnedTerms(flowId);
      if (alias && !aliases.includes(alias) && aliases.length < 50) aliases.push(alias);
      learning.aliases[flowId] = aliases;
      delete learning.candidates[alias];
    }
    saveLearning();
  }

  async function classifyWithAI(text) {
    try {
      const payload = {
        message: text,
        flows: (library?.flows || []).map(f => ({ id: f.id, title: f.title, match: f.match, device: f.device, category: f.category }))
      };
      const r = await fetch(CLASSIFIER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!r.ok) return null;
      const data = await r.json();
      if (data?.flow_id && Number(data.confidence) >= .72) return library.flows.find(f => f.id === data.flow_id) || null;
    } catch (err) {
      console.warn('27sys N1 classifier unavailable', err);
    }
    return null;
  }

  function explainSource(flow) {
    if (!flow?.source) return;
    const label = flow.source.includes('microsoft') ? 'Microsoft Support' : flow.source.includes('apple') ? 'Apple Support' : flow.source.includes('google') ? 'Google/Android Help' : 'Documentation technique';
    add(`Base utilisée : ${label}.`, false, false, true);
  }

  function reset() {
    state = { flowId: null, step: null, initialText: null, candidateFlowId: null };
    try { sessionStorage.removeItem(STATE_KEY); } catch {}
    chat.innerHTML = '<div class="ai27-welcome">Bonjour 👋 Décrivez simplement votre problème. Je cherche d’abord dans ma bibliothèque N1 et n’utilise l’IA que lorsque le cas est ambigu ou nouveau.</div>';
    chat.appendChild(loading);
    loadingState(false);
    setWA();
    input.focus();
    scroll();
  }

  async function ensureLibrary() {
    if (library) return;
    loadingState(true, 'Chargement de la bibliothèque technique…');
    const r = await fetch(LIBRARY_URL, { cache: 'force-cache' });
    if (!r.ok) throw new Error(`Bibliothèque indisponible (${r.status})`);
    library = await r.json();
    loadPersistence();
    loadingState(false);
  }

  async function ask() {
    const text = input.value.trim();
    if (!text || send.disabled) return;
    input.value = '';
    add(text, true);
    send.disabled = true;
    loadingState(true, 'Recherche dans la base N1…');

    try {
      await ensureLibrary();
      let flow = currentFlow();
      let result;

      if (flow) {
        result = nextFromAnswer(flow, text);
      } else {
        const detected = detectFlow(text);
        flow = detected.flow;
        if (!flow || detected.confidence < .6) {
          loadingState(true, 'Cas ambigu : vérification IA minimale…');
          flow = await classifyWithAI(text);
          loadingState(false);
        }
        if (!flow) {
          add('Je ne trouve pas encore une procédure N1 suffisamment fiable pour ce problème. Je préfère ne pas inventer une manipulation. Précise l’appareil et le symptôme, ou contacte 27sys directement.', false, true);
          setWA();
          return;
        }
        state.candidateFlowId = flow.id;
        result = { message: startFlow(flow, text) };
        explainSource(flow);
      }

      loadingState(false);
      add(result.message);
      setWA();

      if (result.end === 'resolved') {
        recordCase(flow.id, 'resolved');
        state = { flowId: null, step: null, initialText: null, candidateFlowId: null };
        saveState();
      } else if (result.end === 'escalate') {
        recordCase(flow.id, 'escalate');
        add('➡️ Le diagnostic N1 s’arrête ici. Tu peux contacter 27sys sur WhatsApp pour la suite.');
      }
    } catch (err) {
      console.error('27sys N1 Assistant', err);
      loadingState(false);
      add('La bibliothèque N1 n’est momentanément pas disponible. Tu peux contacter 27sys directement sur WhatsApp.', false, true);
    } finally {
      loadingState(false);
      send.disabled = false;
      input.focus();
      scroll();
    }
  }

  loadPersistence();
  launcher.onclick = e => {
    if (e.target.closest('.ai27-dismiss')) { launcher.classList.remove('visible'); return; }
    app.classList.add('open');
    launcher.classList.remove('visible');
    input.focus();
  };
  app.querySelector('.ai27-close').onclick = () => { app.classList.remove('open'); launcher.classList.add('visible'); };
  document.getElementById('ai27-reset').onclick = reset;
  send.onclick = ask;
  input.onkeydown = e => { if (e.key === 'Enter') ask(); };
  setTimeout(() => launcher.classList.add('visible'), 1800);
  setWA();
})();
