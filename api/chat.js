export const runtime = 'nodejs';

const ALLOWED_ORIGINS = new Set([
  'https://27sys.github.io',
  'https://27sys.ma',
  'https://www.27sys.ma',
  'https://27sys.vercel.app'
]);

const MODEL = 'gemini-3.7-flash';

const SYSTEM_INSTRUCTION = `Tu es 27sys Assistant, le technicien virtuel de 27sys Services à Casablanca.

Ton rôle est d'avoir une vraie conversation de dépannage avec le client, pas de réciter un manuel.
Comprends immédiatement le français naturel, les fautes, les abréviations, le langage familier, le mélange français/darija et les phrases incomplètes. Le client ne doit pas avoir besoin de reformuler.

Exemples de compréhension :
- « mon pc capte le wifi mais ya pas internet » = le PC est connecté au Wi-Fi mais n'accède probablement pas à Internet.
- « la tv veut pas netflix » = problème probable d'application/connexion sur la TV.
- « mon pc démarre mais écran noir » = problème d'affichage au démarrage.

CONVERSATION
- Parle comme un technicien humain, calme, direct et naturel.
- Réponds normalement en 1 à 4 phrases courtes.
- Pose UNE seule question à la fois.
- Ne demande jamais au client de reformuler si tu peux comprendre son intention.
- Tiens compte de ce qui a déjà été dit et ne repose pas la même question.
- Ne donne pas 8 étapes d'un coup : avance étape par étape.
- Explique brièvement pourquoi une vérification est utile lorsque cela aide le client.
- Adapte ton niveau de détail à la personne. Si elle demande une explication, explique davantage.
- Si le problème est clair, commence directement par la vérification la plus pertinente.
- Si le client dit que c'est résolu, termine naturellement et brièvement.
- Si plusieurs vérifications ne résolvent rien ou si le problème semble matériel/complexe, propose que 27sys prenne le relais.

DOMAINES
Ordinateur, Windows, logiciels, hardware, PC Gaming, Wi-Fi, réseaux, téléphones, tablettes, TV et imprimantes.

SÉCURITÉ
Tu peux recommander des actions simples et réversibles : redémarrer, vérifier un câble, tester un autre port, vérifier un réglage, reconnecter le Wi-Fi, vérifier la file d'impression, vérifier une mise à jour ou l'espace disque.
Ne conseille pas d'ouvrir un appareil, de toucher au secteur, de réparer une alimentation, de manipuler une batterie gonflée, de flasher un firmware, de contourner un mot de passe, de supprimer des données ou d'installer un logiciel douteux.
En cas de fumée, odeur de brûlé, liquide, batterie gonflée, étincelles, choc électrique ou risque important de perte de données : arrête le dépannage, recommande de ne plus utiliser l'appareil et propose 27sys.
Ne demande jamais de mot de passe, code PIN, code bancaire ou autre secret.
Ne prétends jamais avoir effectué une action à distance.

STYLE À ÉVITER
N'écris pas « Selon votre description », « En tant qu'IA », « Voici plusieurs étapes » ou des paragraphes génériques de manuel.
Tu es un assistant conversationnel de 27sys, pas une FAQ.`;

function corsHeaders(origin) {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://27sys.github.io';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

function sendJson(res, status, payload, origin) {
  const body = JSON.stringify(payload);
  res.statusCode = status;
  for (const [key, value] of Object.entries({
    ...corsHeaders(origin),
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  })) res.setHeader(key, value);
  res.end(body);
}

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  return {};
}

function normalizeHistory(input) {
  if (!Array.isArray(input)) return [];
  const raw = input
    .filter(item => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
    .map(item => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      text: item.content.trim().slice(0, 1800)
    }))
    .filter(item => item.text);
  while (raw.length && raw[0].role !== 'user') raw.shift();
  const merged = [];
  for (const item of raw.slice(-6)) {
    const last = merged[merged.length - 1];
    if (last && last.role === item.role) last.text += `\n${item.text}`;
    else merged.push({ ...item });
  }
  return merged;
}

function toContents(history) {
  return history.map(item => ({ role: item.role, parts: [{ text: item.text }] }));
}

async function callGemini(apiKey, contents, stream) {
  const endpoint = stream
    ? `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse`
    : `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  return fetch(endpoint, {
    method: 'POST',
    headers: {'Content-Type': 'application/json','x-goog-api-key': apiKey},
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents,
      generationConfig: { maxOutputTokens: 220, thinkingConfig: { thinkingLevel: 'low' } }
    })
  });
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    for (const [key, value] of Object.entries(corsHeaders(origin))) res.setHeader(key, value);
    return res.end();
  }
  if (req.method === 'GET') return sendJson(res, 200, {ok:true, service:'27sys Gemini Assistant', model:MODEL}, origin);
  if (req.method !== 'POST') return sendJson(res, 405, {error:'Method not allowed'}, origin);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return sendJson(res, 500, {error:'Gemini API key is not configured on Vercel.'}, origin);

  let body;
  try { body = parseBody(req); } catch { return sendJson(res, 400, {error:'Invalid JSON body.'}, origin); }
  const history = normalizeHistory(body?.history);
  if (!history.length || history[history.length - 1].role !== 'user') return sendJson(res, 400, {error:'The last conversation turn must be a user message.'}, origin);
  const contents = toContents(history);

  try {
    let upstream = await callGemini(apiKey, contents, true);
    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(()=>'Unknown Gemini streaming error');
      console.error('Gemini stream request failed:', upstream.status, detail);
      upstream = await callGemini(apiKey, contents, false);
    }
    if (!upstream.ok) {
      const detail = await upstream.text().catch(()=>'Unknown Gemini error');
      console.error('Gemini request failed:', upstream.status, detail);
      return sendJson(res, 502, {error:'Gemini request failed.'}, origin);
    }

    const type = upstream.headers.get('content-type') || '';
    if (!type.includes('text/event-stream')) {
      const data = await upstream.json();
      const answer = data?.candidates?.[0]?.content?.parts?.map(p=>p?.text||'').join('').trim();
      if (!answer) return sendJson(res, 502, {error:'Gemini returned no text.'}, origin);
      return sendJson(res, 200, {response:answer}, origin);
    }

    res.statusCode = 200;
    for (const [key, value] of Object.entries({...corsHeaders(origin),'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform','X-Accel-Buffering':'no','Connection':'keep-alive'})) res.setHeader(key, value);
    if (typeof res.flushHeaders === 'function') res.flushHeaders();

    const reader = upstream.body.getReader();
    try {
      while (true) {
        const {value, done} = await reader.read();
        if (done) break;
        if (value) res.write(Buffer.from(value));
      }
    } finally { try { reader.releaseLock(); } catch {} }
    return res.end();
  } catch (error) {
    console.error('/api/chat error:', error);
    if (!res.headersSent) return sendJson(res, 500, {error:'Internal server error.'}, origin);
    return res.end();
  }
}
