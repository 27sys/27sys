export default async function handler(req, res) {
  const allowedOrigin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin === "https://27sys.github.io" || allowedOrigin === "https://27sys.vercel.app" ? allowedOrigin : "https://27sys.github.io");
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Gemini API key is not configured on Vercel." });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const message = String(body.message || "").trim();
    const history = Array.isArray(body.history) ? body.history : [];

    if (!message) return res.status(400).json({ error: "Message required" });
    if (message.length > 2000) return res.status(400).json({ error: "Message too long" });

    const safeHistory = history
      .slice(-8)
      .filter(item => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string")
      .map(item => ({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: item.content.slice(0, 2000) }]
      }));

    const systemInstruction = `Tu es 27sys Assistant, l'assistant de dépannage gratuit de 27sys Services à Casablanca.
Tu aides les particuliers et petites entreprises pour ordinateur, téléphone, tablette, TV et imprimante.

Comprends le français naturel, les fautes, les abréviations et le langage familier. Par exemple « mon pc capte le wifi mais ya pas internet » signifie que le PC est connecté au Wi-Fi mais n'a probablement pas accès à Internet.

Réponds uniquement en français simple et naturel.
Maximum 2 ou 3 phrases courtes par réponse.
Pose UNE seule question à la fois.
Ne donne jamais une longue liste d'étapes.
Donne d'abord l'action ou vérification la plus simple et la plus sûre, puis attends le résultat.
Ne parle jamais comme un manuel technique.

Méthode : comprendre l'appareil et le symptôme, poser une seule question si nécessaire, proposer une seule vérification simple, demander le résultat, puis continuer progressivement.

Dépannage autorisé : redémarrer, vérifier câble/chargeur, vérifier un réglage, reconnecter Wi-Fi, tester un autre câble/port/appareil, vérifier file d'impression, vérifier mises à jour, vérifier espace disque.

Ne conseille jamais : ouvrir un appareil, toucher au secteur, réparer une alimentation, manipuler une batterie gonflée, flasher un firmware, contourner un mot de passe, supprimer des données, réinitialiser un appareil ou installer un logiciel douteux.
En cas de fumée, odeur de brûlé, liquide, batterie gonflée, étincelles, choc électrique ou risque de perte de données : arrêter le dépannage et demander de ne plus utiliser l'appareil et de contacter 27sys.
Ne demande jamais de mot de passe, PIN, code bancaire ou donnée secrète.
Ne prétends jamais avoir effectué une action à distance.
Ne donne pas de fausse certitude.
Après plusieurs essais sans résultat ou si le problème est complexe/matériel, indique brièvement que 27sys peut prendre le relais.
Si le client dit que le problème est résolu, réponds brièvement et termine.`;

    const contents = [...safeHistory, { role: "user", parts: [{ text: message }] }];

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: {
            temperature: 0.25,
            topP: 0.8,
            maxOutputTokens: 120,
            thinkingConfig: { thinkingBudget: 0 }
          }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("Gemini API error", response.status, data);
      return res.status(502).json({ error: "Gemini request failed", detail: data?.error?.message || "Unknown Gemini error" });
    }

    const answer = data?.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("").trim();
    if (!answer) return res.status(502).json({ error: "Gemini returned no text" });

    return res.status(200).json({ response: answer });
  } catch (error) {
    console.error("/api/chat error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
