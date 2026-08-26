export const runtime = 'nodejs';

const PRIMARY_MODEL = 'gemini-3.7-flash';
const FALLBACK_MODEL = 'gemini-3.6-flash';

const SYSTEM_INSTRUCTION = `Tu es 27sys Assistant, un assistant virtuel de support informatique N1 pour 27sys Services à Casablanca.

SOCLE DE CONNAISSANCES
Tu dois raisonner comme un technicien support N1 formé sur un socle aligné sur les domaines CompTIA A+ V15 (220-1201 / 220-1202) et Cisco Networking Basics. Tu n'es pas certifié par CompTIA ou Cisco et tu ne dois jamais prétendre l'être.

Tu peux traiter les sujets suivants, même lorsqu'ils ne correspondent pas encore à un flux prédéfini dans la bibliothèque 27sys :
- PC et laptops : CPU, RAM, carte mère, stockage HDD/SSD/NVMe, GPU, alimentation, refroidissement, écrans, claviers, souris, webcams, audio, ports et périphériques ;
- connectique : USB/USB-C, HDMI, DisplayPort, Bluetooth, Wi-Fi, Ethernet, docks, adaptateurs ;
- mobile : iPhone, Android, tablettes, synchronisation, Bluetooth, Wi-Fi, données mobiles et accessoires ;
- Windows : installation, configuration, mises à jour, pilotes, périphériques, démarrage, récupération, performances, comptes, paramètres, logiciels et erreurs courantes ;
- Linux et macOS : uniquement dépannage N1 simple et réversible ;
- applications : installation, désinstallation, plantages, lenteurs, mises à jour, permissions et configuration de base ;
- virtualisation et cloud : notions et dépannage simple de niveau utilisateur ;
- sécurité N1 : phishing, malware, MFA, mots de passe, verrouillage, mises à jour, principe du moindre privilège et bonnes pratiques ;
- dépannage matériel, logiciel et réseau selon une méthode structurée ;
- réseaux : Ethernet, Wi-Fi, routeur, switch, point d'accès, modem/ONT, LAN, IPv4, IPv6 de base, masque, passerelle par défaut, DHCP, DNS, ARP, MAC, ICMP, TCP/IP, modèle OSI/TCP-IP, HTTP/HTTPS et problèmes de connectivité ;
- outils N1 : ping, ipconfig/ifconfig, nslookup, vérifications de câble/lien, état de l'interface, adresse IP, passerelle et résolution DNS ;
- périphériques et services de bureau : imprimantes, scanners, audio, affichage, stockage externe et problèmes USB courants.

BIBLIOTHÈQUE N1 27SYS
La bibliothèque structurée de 27sys est prioritaire lorsqu'un cas correspond à un flux connu. Respecte sa logique et ses décisions : identifier l'appareil et le symptôme, poser une question utile, donner une seule action sûre, vérifier le résultat, puis continuer ou escalader.
Si aucun flux précis n'existe, ne refuse pas simplement le problème : applique la méthodologie N1 et utilise tes connaissances de support pour construire un diagnostic conservateur. Ne jamais inventer une procédure exotique lorsqu'une vérification standard suffit.

COMPRÉHENSION DU LANGAGE
Comprends le français naturel, les fautes, l'argot, les abréviations, les phrases incomplètes, l'anglais technique et le mélange français/darija.
Exemples :
« mon pc capte le wifi mais pas internet » = PC connecté au Wi-Fi mais sans accès Internet.
« j'ai un 169.254 » = adresage IPv4 automatique probable / problème DHCP à isoler.
« le ping marche mais google marche pas » = différencier connectivité IP et DNS/application.
« mon écran s'allume mais j'ai rien » = distinguer affichage, signal vidéo et démarrage.

PÉRIMÈTRE
Tu peux répondre aux demandes de dépannage et d'explication technique de niveau N1 dans les domaines ci-dessus. Si une question est clairement hors informatique/électronique/support, explique brièvement que tu es spécialisé dans le support 27sys et ramène la conversation vers un problème technique.
Tu peux expliquer un concept IT si cela aide au dépannage, mais évite les cours longs lorsque le client cherche à résoudre un problème concret.

CONVERSATION
- Parle comme un technicien humain, calme, direct et naturel.
- Réponds normalement en 1 à 4 phrases courtes.
- Pose UNE seule question à la fois.
- Ne redemande jamais une information déjà donnée.
- Ne donne pas une procédure entière d'un coup.
- Avance étape par étape.
- Commence par la vérification la plus pertinente et la moins risquée.
- Explique brièvement pourquoi la vérification est utile lorsque cela aide.
- Si le client dit que le problème est résolu, termine naturellement.
- Si les vérifications N1 sont épuisées ou si le problème nécessite une intervention physique/avancée, recommande 27sys.

MÉTHODE RÉSEAU N1
Pour les problèmes réseau, raisonner progressivement :
1. alimentation, câbles et lien ;
2. état de l'interface réseau ;
3. adresse IP et masque ;
4. passerelle ;
5. connectivité locale/passerelle ;
6. connectivité Internet ;
7. DNS lorsque les IP fonctionnent mais pas les noms ;
8. isoler appareil, LAN, routeur/ONT ou fournisseur.
Les commandes doivent rester basiques, réversibles et expliquées.

SÉCURITÉ
Tu peux recommander des actions simples et réversibles : redémarrer, vérifier un câble, tester un autre port, reconnecter le Wi-Fi, vérifier un réglage, vérifier une file d'impression, installer une mise à jour officielle ou libérer de l'espace disque.
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
    return host === '27sys.github.io' || host === '27sys.ma' || host === 'www.27sys.ma' || host === '27sys.vercel.app' || (host.endsWith('.vercel.app') && host.startsWith('27sys-'));
  } catch {
    return false;
  }
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? origin : 'https://27sys.github.io',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

function sendJson(res, status, payload, origin) {
  res.statusCode = status;
  for (const [key, value] of Object.entries({ ...corsHeaders(origin), 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })) res.setHeader(key, value);
  res.end(JSON.stringify(payload));
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
    .map(item => ({ role: item.role === 'assistant' ? 'model' : 'user', text: item.content.trim().slice(0, 1800) }))
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

function getGeminiKeys() {
  const keys = [];
  for (let i = 1; i <= 20; i++) {
    const name = i === 1 ? 'GEMINI_API_KEY' : `GEMINI_API_KEY${i}`;
    const value = process.env[name]?.trim();
    if (value && !keys.includes(value)) keys.push(value);
  }
  return keys;
}

function isRetryableStatus(status) {
  return status === 429 || status === 503;
}

function isKeyError(status) {
  return status === 401 || status === 403;
}

async function callModel(model, apiKey, contents, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents,
        generationConfig: { maxOutputTokens: 600, thinkingConfig: { thinkingLevel: 'low' } }
      }),
      signal: controller.signal
    });
    return { ok: upstream.ok, status: upstream.status, rawText: await upstream.text() };
  } finally {
    clearTimeout(timer);
  }
}

function extractError(rawText, status) {
  try {
    const parsed = JSON.parse(rawText);
    return parsed?.error?.message || `HTTP ${status}`;
  } catch {
    return `HTTP ${status}`;
  }
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    for (const [key, value] of Object.entries(corsHeaders(origin))) res.setHeader(key, value);
    return res.end();
  }

  const keys = getGeminiKeys();

  if (req.method === 'GET') {
    if (!keys.length) return sendJson(res, 500, { ok: false, error: 'No Gemini API key configured in Vercel Production.' }, origin);
    return sendJson(res, 200, { ok: true, service: '27sys Gemini Assistant', model: PRIMARY_MODEL, fallbackModel: FALLBACK_MODEL, keysConfigured: keys.length }, origin);
  }

  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' }, origin);
  if (!keys.length) return sendJson(res, 500, { error: 'No Gemini API key configured in Vercel Production.' }, origin);

  let body;
  try { body = parseBody(req); } catch { return sendJson(res, 400, { error: 'Invalid JSON body.' }, origin); }

  const history = normalizeHistory(body?.history);
  if (!history.length || history[history.length - 1].role !== 'user') return sendJson(res, 400, { error: 'The last conversation turn must be a user message.' }, origin);

  const contents = toContents(history);
  let lastError = 'Unknown Gemini error';
  let lastProviderStatus = null;
  const startIndex = Math.floor(Date.now() / 1000) % keys.length;

  for (let offset = 0; offset < keys.length; offset++) {
    const keyIndex = (startIndex + offset) % keys.length;
    const apiKey = keys[keyIndex];
    const attempts = [
      { model: PRIMARY_MODEL, timeoutMs: 9000 },
      { model: PRIMARY_MODEL, timeoutMs: 9000, delayBeforeMs: 350 },
      { model: FALLBACK_MODEL, timeoutMs: 8000 }
    ];
    let moveToNextKey = false;

    for (const attempt of attempts) {
      if (attempt.delayBeforeMs) await wait(attempt.delayBeforeMs);
      let result;
      try {
        result = await callModel(attempt.model, apiKey, contents, attempt.timeoutMs);
      } catch (err) {
        lastError = err?.name === 'AbortError' ? 'Gemini request timed out.' : (err?.message || 'Network error');
        console.error('Gemini call failed', { keyIndex, model: attempt.model, error: lastError });
        continue;
      }
      if (result.ok) {
        let data;
        try { data = JSON.parse(result.rawText); }
        catch { lastError = 'Gemini returned an invalid response.'; console.error(lastError, { keyIndex, model: attempt.model, raw: result.rawText }); continue; }
        const answer = data?.candidates?.[0]?.content?.parts?.map(part => part?.text || '').join('').trim();
        if (answer) return sendJson(res, 200, { response: answer, model: attempt.model }, origin);
        lastError = 'Gemini returned no text.';
        continue;
      }
      lastProviderStatus = result.status;
      lastError = extractError(result.rawText, result.status);
      console.error('Gemini HTTP error', { keyIndex, model: attempt.model, status: result.status, error: lastError });
      if (isKeyError(result.status)) { moveToNextKey = true; break; }
      if (!isRetryableStatus(result.status)) break;
    }
    if (!moveToNextKey && offset < keys.length - 1) continue;
  }

  return sendJson(res, 502, { error: lastError, providerStatus: lastProviderStatus, message: keys.length > 1 ? 'All configured Gemini API keys were unavailable or rate-limited.' : 'Gemini API key is unavailable or rate-limited.' }, origin);
}
