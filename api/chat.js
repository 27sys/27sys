export const runtime = 'nodejs';

// Modèle principal (le plus capable), puis modèle de secours stable si le
// principal est temporairement surchargé côté Google (429 / 503).
const PRIMARY_MODEL = 'gemini-3.7-flash';
const FALLBACK_MODEL = 'gemini-3.6-flash';

const SYSTEM_INSTRUCTION = `Tu es 27sys Assistant, le technicien virtuel de 27sys Services à Casablanca.

Tu dois avoir une vraie conversation de dépannage, naturelle et utile.
Comprends le français naturel, les fautes, les abréviations, le langage familier, le mélange français/darija et les phrases incomplètes.
Le client ne doit jamais avoir besoin de reformuler son problème.

PÉRIMÈTRE STRICT : tu ne réponds qu'aux questions de dépannage informatique/électronique (PC, Windows, hardware, PC Gaming, Wi-Fi/réseau, téléphones, tablettes, TV, imprimantes). Si on te demande autre chose (rédaction, devoirs, code, sujet sans rapport), dis brièvement que tu es uniquement l'assistant de dépannage 27sys et redemande le problème technique.

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

function isAllowedOrigin(origin) {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    const host = url.hostname.toLowerCase();
    return (
      host === '27sys.github.io' ||
      host === '27sys.ma' ||
      host === 'www.27sys.ma' ||
      host === '27sys.vercel.app' ||
      (host.endsWith('.vercel.app') && host.startsWith('27sys-'))
    );
  } catch {
    return false;
  }
}

function corsHeaders(origin) {
  const allowed = isAllowedOrigin(origin) ? origin : 'https://27sys.github.io';
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

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Appelle un modèle Gemini avec un délai maximum, pour ne jamais rester
// bloqué si Google est lent à répondre (le visiteur ne doit jamais attendre
// indéfiniment un "..." qui ne se termine pas).
async function callModel(model, apiKey, contents, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents,
          generationConfig: {
            maxOutputTokens: 220,
            thinkingConfig: { thinkingLevel: 'low' }
          }
        }),
        signal: controller.signal
      }
    );
    const rawText = await upstream.text();
    return { ok: upstream.ok, status: upstream.status, rawText };
  } finally {
    clearTimeout(timer);
  }
}

function isRetryableStatus(status) {
  // 429 = quota/rate limit dépassé, 503 = modèle temporairement surchargé côté Google
  return status === 429 || status === 503;
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
    return sendJson(res, 200, { ok: true, service: '27sys Gemini Assistant', model: PRIMARY_MODEL, fallbackModel: FALLBACK_MODEL, keyConfigured: true }, origin);
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

  const contents = toContents(history);

  // Ordre d'essai : modèle principal -> nouvel essai après une courte pause
  // -> modèle de secours stable. Chaque tentative a son propre délai maximum
  // pour rester dans le temps d'exécution autorisé par Vercel (voir vercel.json).
  const attempts = [
    { model: PRIMARY_MODEL, timeoutMs: 9000 },
    { model: PRIMARY_MODEL, timeoutMs: 9000, delayBeforeMs: 500 },
    { model: FALLBACK_MODEL, timeoutMs: 8000 }
  ];

  let lastError = 'Unknown Gemini error';
  let lastProviderStatus = null;

  for (const attempt of attempts) {
    if (attempt.delayBeforeMs) await wait(attempt.delayBeforeMs);

    let result;
    try {
      result = await callModel(attempt.model, apiKey, contents, attempt.timeoutMs);
    } catch (err) {
      lastError = err?.name === 'AbortError' ? 'Gemini request timed out.' : (err?.message || 'Network error');
      console.error('Gemini call failed', attempt.model, lastError);
      continue;
    }

    if (result.ok) {
      let data;
      try {
        data = JSON.parse(result.rawText);
      } catch {
        console.error('Gemini returned invalid JSON', attempt.model, result.rawText);
        lastError = 'Gemini returned an invalid response.';
        continue;
      }
      const answer = data?.candidates?.[0]?.content?.parts?.map(part => part?.text || '').join('').trim();
      if (answer) return sendJson(res, 200, { response: answer, model: attempt.model }, origin);
      lastError = 'Gemini returned no text.';
      console.error(lastError, attempt.model, result.rawText);
      continue;
    }

    lastProviderStatus = result.status;
    try {
      const parsed = JSON.parse(result.rawText);
      lastError = parsed?.error?.message || `HTTP ${result.status}`;
    } catch {
      lastError = `HTTP ${result.status}`;
    }
    console.error('Gemini HTTP error', attempt.model, result.status, result.rawText);

    // Erreur non temporaire (clé invalide, requête malformée, contenu bloqué...) :
    // inutile d'insister avec d'autres modèles, on arrête tout de suite.
    if (!isRetryableStatus(result.status)) break;
  }

  return sendJson(res, 502, { error: lastError, providerStatus: lastProviderStatus }, origin);
}
