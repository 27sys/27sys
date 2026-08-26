export const runtime = 'nodejs';

const MODEL = 'gemini-3.1-flash-lite';

function getKeys() {
  const keys = [];
  for (let i = 1; i <= 20; i++) {
    const name = i === 1 ? 'GEMINI_API_KEY' : `GEMINI_API_KEY${i}`;
    const key = process.env[name]?.trim();
    if (key && !keys.includes(key)) keys.push(key);
  }
  return keys;
}

function cors(origin) {
  let allowed = 'https://27sys.github.io';
  try {
    const host = new URL(origin || '').hostname.toLowerCase();
    if (host === '27sys.github.io' || host === '27sys.ma' || host === 'www.27sys.ma' || host === '27sys.vercel.app' || (host.endsWith('.vercel.app') && host.startsWith('27sys-'))) allowed = origin;
  } catch {}
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

function json(res, status, data, origin) {
  res.statusCode = status;
  for (const [k, v] of Object.entries({ ...cors(origin), 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })) res.setHeader(k, v);
  res.end(JSON.stringify(data));
}

async function call(key, payload) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: 'Tu es un classifieur N1. Tu ne résous jamais le problème. Tu choisis uniquement le flow_id le plus approprié dans la liste fournie. Retourne UNIQUEMENT un JSON valide de la forme {"flow_id":"...","confidence":0.0}. Si aucun flow ne correspond vraiment, utilise null. confidence entre 0 et 1.' }] },
      contents: [{ role: 'user', parts: [{ text: JSON.stringify(payload) }] }],
      generationConfig: { maxOutputTokens: 80, thinkingConfig: { thinkingLevel: 'low' } }
    })
  });
  return { ok: r.ok, status: r.status, text: await r.text() };
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (req.method === 'OPTIONS') { res.statusCode = 204; for (const [k,v] of Object.entries(cors(origin))) res.setHeader(k,v); return res.end(); }
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' }, origin);
  const keys = getKeys();
  if (!keys.length) return json(res, 500, { error: 'No Gemini API key configured.' }, origin);

  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); } catch { return json(res, 400, { error: 'Invalid JSON.' }, origin); }
  const message = String(body?.message || '').trim().slice(0, 1200);
  const flows = Array.isArray(body?.flows) ? body.flows.slice(0, 80) : [];
  if (!message || !flows.length) return json(res, 400, { error: 'message and flows are required.' }, origin);

  const payload = {
    client_message: message,
    candidate_flows: flows.map(f => ({ id: f.id, title: f.title, match: f.match, device: f.device, category: f.category }))
  };

  for (const key of keys) {
    try {
      const result = await call(key, payload);
      if (!result.ok) { if (result.status === 401 || result.status === 403 || result.status === 429 || result.status === 503) continue; return json(res, 502, { error: `Gemini classifier HTTP ${result.status}` }, origin); }
      const data = JSON.parse(result.text);
      const text = data?.candidates?.[0]?.content?.parts?.map(p => p?.text || '').join('').trim() || '';
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return json(res, 200, { flow_id: null, confidence: 0 }, origin);
      const parsed = JSON.parse(match[0]);
      const allowed = new Set(flows.map(f => f.id));
      const flowId = allowed.has(parsed.flow_id) ? parsed.flow_id : null;
      const confidence = Math.max(0, Math.min(1, Number(parsed.confidence) || 0));
      return json(res, 200, { flow_id: flowId, confidence }, origin);
    } catch (err) {
      console.error('27sys classifier error', err);
    }
  }
  return json(res, 503, { error: 'Classifier temporarily unavailable.' }, origin);
}
