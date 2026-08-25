const ALLOWED_ORIGINS = new Set([
  "https://27sys.github.io",
  "https://27sys.ma",
  "https://www.27sys.ma",
  "https://27sys.vercel.app"
]);

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
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://27sys.github.io";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

function badRequest(message, status = 400, origin = "") {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

export default {
  async fetch(request) {
    const origin = request.headers.get("origin") || "";
    const cors = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== "POST") {
      return badRequest("Method not allowed", 405, origin);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return badRequest("Gemini API key is not configured on Vercel.", 500, origin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return badRequest("Invalid JSON body.", 400, origin);
    }

    const history = Array.isArray(body?.history) ? body.history : [];
    if (!history.length) {
      return badRequest("Message required", 400, origin);
    }

    const contents = history
      .slice(-6)
      .filter(item => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string")
      .map(item => ({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: item.content.slice(0, 1500) }]
      }))
      .filter(item => item.parts[0].text.trim());

    if (!contents.length || contents[contents.length - 1].role !== "user") {
      return badRequest("The last conversation turn must be a user message.", 400, origin);
    }

    const payload = {
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }]
      },
      contents,
      generationConfig: {
        maxOutputTokens: 220,
        thinkingConfig: {
          thinkingLevel: "low"
        }
      }
    };

    try {
      const upstream = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:streamGenerateContent?alt=sse",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey
          },
          body: JSON.stringify(payload)
        }
      );

      if (!upstream.ok || !upstream.body) {
        const detail = await upstream.text().catch(() => "Unknown Gemini error");
        console.error("Gemini streaming error", upstream.status, detail);
        return badRequest("Gemini request failed.", 502, origin);
      }

      return new Response(upstream.body, {
        status: 200,
        headers: {
          ...cors,
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "X-Accel-Buffering": "no"
        }
      });
    } catch (error) {
      console.error("/api/chat error", error);
      return badRequest("Internal server error.", 500, origin);
    }
  }
};
