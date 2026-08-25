export const runtime = 'nodejs';

const ALLOWED_ORIGINS = new Set([
  'https://27sys.github.io',
  'https://27sys.ma',
  'https://www.27sys.ma',
  'https://27sys.vercel.app'
]);

const MODEL = 'gemini-3.7-flash';

const SYSTEM_INSTRUCTION = `Tu es 27sys Assistant, le technicien virtuel de 27sys Services à Casablanca.

Tu dois avoir une vraie conversation de dépannage, naturelle et utile.
Comprends le français naturel, les fautes, les abréviations, le langage familier, le mélange français/darija et les phrases incomplètes.
Le client ne doit jamais avoir besoin de reformuler son problème.

CONVERSATION
- Parle comme un technicien humain, calme, direct et naturel.
- Réponds normalement en 1 à 4 phrases courtes.
- Pose UNE seule question à la fois.
- Ne redemande jamais une information déjà donnée.
- Ne donne pas une longue procédure d'un coup.
- Avance étape par étape.
- Si le problème est clair, commence directement par la vérification la plus pertinente.
- Si le client dit que le problème est résolu, termine naturellement.
- Si plusieurs vérifications échouent ou si le problème est complexe, propose que 27sys prenne le relais.

DOMAINES
Ordinateur, Windows, logiciels, hardware, PC Gaming, Wi-Fi, réseaux, téléphones, tablettes, TV et imprimantes.

SÉCURITÉ
Tu peux recommander des actions simples et réversibles : redémarrer, vérifier un câble, tester un autre port, vérifier un réglage, reconnecter le Wi-Fi, vérifier la file d'impression, une mise à jour ou l'espace disque.
Ne conseille pas d'ouvrir un appareil, de toucher au secteur, de réparer une alimentation, de manipuler une batterie gonflée, de flasher un firmware, de contourner un mot de passe, de supprimer des données ou d'installer un logiciel douteux.
En cas de fumée, odeur de brûlé, liquide, batterie gonflée, étincelles, choc électrique ou risque important de perte de données : arrête le dépannage, recommande de ne plus utiliser l'appareil et propose 27sys.
Ne demande jamais de mot de passe, code PIN, code bancaire ou autre secret.
Ne prétends jamais avoir effectué une action à distance.

STYLE
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

async function callGemini(apiKey, contents) {
  return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents,
      generationConfig: {
        maxOutputTokens: 220,
        thinkingConfig: { thinkingLevel: 'low' }
      }
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

  const apiKey = process.env.GEMINI_API_KEY;

  if (req.method === 'GET') {
    if (!apiKey) return sendJson(res, 500, { ok: false, error: 'GEMINI_API_KEY is missing in Production.' }, origin);
    return sendJson(res, 200, { ok: true, service: '27sys Gemini Assistant', model: MODEL, keyConfigured: true }, origin);
  }

  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' }, origin);
  if (!apiKey) return sendJson(res, 500, { error: 'GEMINI_API_KEY is missing in Production.' }, origin);

  let body;
  try {
    body = parseBody(req);
  } catch {
    return sendJson(res, 400, { error: 'Invalid JSON body.' }, origin);
  }

  const history = normalizeHistory(body?.history);
  if (!history.length || history[history.length - 1].role !== 'user') {
    return sendJson(res, 400, { error: 'The last conversation turn must be a user message.' }, origin);
  }

  try {
    const upstream = await callGemini(apiKey, toContents(history));
    const rawText = await upstream.text();

    if (!upstream.ok) {
      console.error('Gemini HTTP error', upstream.status, rawText);
      let detail = 'Gemini request failed.';
      try {
        const parsed = JSON.parse(rawText);
        detail = parsed?.error?.message || detail;
      } catch {}
      return sendJson(res, 502, { error: detail, providerStatus: upstream.status }, origin);
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error('Gemini returned invalid JSON', rawText);
      return sendJson(res, 502, { error: 'Gemini returned an invalid response.' }, origin);
    }

    const answer = data?.candidates?.[0]?.content?.parts?.map(part => part?.text || '').join('').trim();
    if (!answer) {
      console.error('Gemini returned no text', rawText);
      return sendJson(res, 502, { error: 'Gemini returned no text.' }, origin);
    }

    return sendJson(res, 200, { response: answer, model: MODEL }, origin);
  } catch (error) {
    console.error('/api/chat error', error);
    return sendJson(res, 500, { error: 'Internal server error.' }, origin);
  }
}
