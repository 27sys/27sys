/*
 * 27SYS Assistant — Gemini 3.7 Flash, streaming chat widget.
 * GitHub Pages frontend -> Vercel Function -> Gemini API.
 */
(() => {
  "use strict";

  const API_URL = "https://27sys.vercel.app/api/chat";
  const WA_NUMBER = "212640008930";
  const SESSION_KEY = "27sys-ai-chat-v2";

  // Remove any legacy assistant UI so only one chatbot exists.
  ["ai27-launcher", "ai27", "ai27-style", "sys-assistant-launcher", "sys-assistant", "sys-assistant-style"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });

  const style = document.createElement("style");
  style.id = "ai27-style";
  style.textContent = `
    #ai27-launcher{position:fixed;right:24px;bottom:24px;z-index:10001;border:1px solid rgba(21,24,28,.14);background:#15181c;color:#fff;border-radius:16px;padding:14px 16px;display:flex;align-items:center;gap:12px;font:600 13px Inter,Arial,sans-serif;box-shadow:0 18px 44px rgba(0,0,0,.22);cursor:pointer;opacity:0;transform:translateY(16px);pointer-events:none;transition:transform .25s ease,opacity .25s ease,background .25s ease;max-width:340px;text-align:left}
    #ai27-launcher.ai27-visible{opacity:1;transform:translateY(0);pointer-events:auto}
    #ai27-launcher:hover{transform:translateY(-3px);background:#1677ff}
    .ai27-avatar{width:38px;height:38px;min-width:38px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.22);font:700 13px Inter,Arial,sans-serif}
    .ai27-invite{display:flex;flex-direction:column;gap:3px}.ai27-invite strong{font:700 13px 'Space Grotesk',Inter,Arial,sans-serif}.ai27-invite span{color:rgba(255,255,255,.66);font-size:10px}
    .ai27-dismiss{margin-left:auto;width:24px;height:24px;border:0;background:transparent;color:rgba(255,255,255,.65);font-size:18px;cursor:pointer}
    #ai27{position:fixed;right:24px;bottom:24px;z-index:10002;width:min(450px,calc(100vw - 32px));height:min(700px,calc(100vh - 40px));display:none;flex-direction:column;overflow:hidden;background:#f4f3ee;color:#15181c;border:1px solid rgba(21,24,28,.13);box-shadow:0 30px 90px rgba(0,0,0,.3)}
    #ai27.open{display:flex}.ai27-head{display:flex;justify-content:space-between;align-items:center;padding:17px 18px;background:#15181c;color:#fff}
    .ai27-brand{display:flex;align-items:center;gap:11px}.ai27-mark{width:34px;height:34px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.23);font:700 13px Inter,Arial,sans-serif}.ai27-brand strong{display:block;font:700 15px 'Space Grotesk',Inter,Arial,sans-serif}.ai27-brand small{display:block;margin-top:5px;color:rgba(255,255,255,.58);font:9px 'JetBrains Mono',monospace;letter-spacing:.08em;text-transform:uppercase}
    .ai27-close{border:0;background:none;color:#fff;font-size:22px;cursor:pointer}.ai27-body{flex:1;overflow:auto;padding:16px;background:linear-gradient(180deg,#f4f3ee,#ebeae5)}
    .ai27-welcome{padding:11px 13px;margin-bottom:12px;background:rgba(22,119,255,.06);border-left:2px solid #1677ff;font:12px/1.5 Inter,Arial,sans-serif;color:#44484d}.ai27-msg{max-width:90%;margin:0 0 12px;padding:12px 14px;border:1px solid rgba(21,24,28,.1);background:#fff;font:13px/1.55 Inter,Arial,sans-serif;box-shadow:0 6px 16px rgba(21,24,28,.05);white-space:pre-wrap}.ai27-msg.bot:before{content:'27sys Assistant';display:block;margin-bottom:6px;color:#1677ff;font:9px 'JetBrains Mono',monospace;letter-spacing:.08em;text-transform:uppercase}.ai27-msg.user{margin-left:auto;background:#15181c;color:#fff;border-color:#15181c}
    .ai27-status{margin:4px 0 12px;color:#7a7d82;font:9px 'JetBrains Mono',monospace;letter-spacing:.06em;text-transform:uppercase}.ai27-compose{display:flex;gap:8px}.ai27-foot{padding:10px 12px;border-top:1px solid rgba(21,24,28,.12);background:#f4f3ee}.ai27-input{flex:1;min-width:0;padding:11px 12px;border:1px solid #c8c7c1;background:#fff;outline:0;font:13px Inter,Arial,sans-serif}.ai27-input:focus{border-color:#1677ff}.ai27-send{padding:0 15px;border:1px solid #15181c;background:#15181c;color:#fff;font:600 12px Inter,Arial,sans-serif;cursor:pointer}.ai27-send:disabled{opacity:.5;cursor:default}.ai27-actions{display:flex;gap:8px;margin-top:8px}.ai27-action{flex:1;padding:9px;border:1px solid #15181c;text-align:center;text-decoration:none;font:600 11px Inter,Arial,sans-serif}.ai27-wa{background:#15181c;color:#fff}.ai27-reset{background:#fff;color:#15181c;cursor:pointer}.ai27-note{margin-top:7px;text-align:center;color:#777;font:9px/1.4 Inter,Arial,sans-serif}
    .ai27-stream-caret{display:inline-block;width:6px;height:13px;margin-left:2px;vertical-align:-2px;background:#1677ff;animation:ai27blink .8s steps(2,start) infinite}.ai27-error{border-left:2px solid #ff7a45!important;background:#fffaf7!important}
    @keyframes ai27blink{50%{opacity:0}}@media(max-width:600px){#ai27-launcher{right:14px;bottom:14px;max-width:calc(100vw - 28px);padding:12px 13px}#ai27{right:8px;bottom:8px;width:calc(100vw - 16px);height:calc(100vh - 16px)}}
  `;
  document.head.appendChild(style);

  const launcher = document.createElement("button");
  launcher.id = "ai27-launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-label", "Ouvrir l’assistance virtuelle gratuite 27sys");
  launcher.innerHTML = `<span class="ai27-avatar">27</span><span class="ai27-invite"><strong>Assistance Virtuelle Gratuite</strong><span>Parlez à 27sys comme à un technicien.</span></span><span class="ai27-dismiss" aria-hidden="true">×</span>`;
  document.body.appendChild(launcher);

  const app = document.createElement("section");
  app.id = "ai27";
  app.setAttribute("aria-label", "27sys Assistant IA générative");
  app.innerHTML = `
    <div class="ai27-head"><div class="ai27-brand"><div class="ai27-mark">27</div><div><strong>27sys Assistant</strong><small>IA générative • dépannage</small></div></div><button class="ai27-close" type="button" aria-label="Fermer">×</button></div>
    <div class="ai27-body" id="ai27-chat"><div class="ai27-welcome">Bonjour 👋 Décrivez votre problème comme vous le feriez avec un technicien. Je comprends les phrases simples, les fautes et le langage courant.</div></div>
    <div class="ai27-foot"><div class="ai27-compose"><input id="ai27-input" class="ai27-input" type="text" placeholder="Ex. mon pc capte le wifi mais pas internet" autocomplete="off"><button id="ai27-send" class="ai27-send" type="button">Envoyer</button></div><div class="ai27-actions"><a id="ai27-wa" class="ai27-action ai27-wa" target="_blank" rel="noopener">Contacter 27sys</a><button id="ai27-reset" class="ai27-action ai27-reset" type="button">Nouvelle conversation</button></div><div class="ai27-note">Assistance de premier niveau • Aucun mot de passe ou donnée sensible.</div></div>`;
  document.body.appendChild(app);

  const chat = document.getElementById("ai27-chat");
  const input = document.getElementById("ai27-input");
  const send = document.getElementById("ai27-send");
  const wa = document.getElementById("ai27-wa");
  const loading = document.createElement("div");
  loading.className = "ai27-status";
  loading.style.display = "none";
  chat.appendChild(loading);

  let history = [];
  try {
    const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "[]");
    if (Array.isArray(saved)) history = saved.slice(-6);
  } catch {}

  function saveHistory() {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(history.slice(-6))); } catch {}
  }

  function scroll() { chat.scrollTop = chat.scrollHeight; }

  function addMessage(text, user = false, error = false) {
    const el = document.createElement("div");
    el.className = `ai27-msg ${user ? "user" : "bot"}${error ? " ai27-error" : ""}`;
    el.textContent = text;
    chat.insertBefore(el, loading);
    scroll();
    return el;
  }

  function setLoading(on, text = "27sys réfléchit…") {
    loading.style.display = on ? "block" : "none";
    if (on) loading.textContent = text;
    scroll();
  }

  function setWhatsApp() {
    const lastUser = history.filter(x => x.role === "user").slice(-2).map(x => x.content).join(" / ") || "un problème informatique";
    wa.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Bonjour 27sys, j’ai utilisé l’Assistant. Mon problème est : ${lastUser}. Le problème n’est pas résolu.`)}`;
  }

  function resetConversation() {
    history = [];
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
    chat.innerHTML = `<div class="ai27-welcome">Bonjour 👋 Décrivez votre problème comme vous le feriez avec un technicien. Je comprends les phrases simples, les fautes et le langage courant.</div>`;
    chat.appendChild(loading);
    loading.style.display = "none";
    setWhatsApp();
    scroll();
    input.focus();
  }

  function openAssistant() {
    app.classList.add("open");
    launcher.classList.remove("ai27-visible");
    input.focus();
  }

  function closeAssistant() {
    app.classList.remove("open");
    launcher.classList.add("ai27-visible");
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text || send.disabled) return;

    input.value = "";
    addMessage(text, true);

    // Build the next conversation locally, so the current user turn is sent exactly once.
    const nextHistory = [...history, { role: "user", content: text }].slice(-6);
    history = nextHistory;
    saveHistory();
    setWhatsApp();

    send.disabled = true;
    setLoading(true, "Connexion à 27sys…");

    let botMessage = null;
    let botText = "";
    let streamBuffer = "";
    let gotFirstToken = false;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: nextHistory }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!response.ok) {
        let message = "L’assistance virtuelle est momentanément indisponible.";
        try {
          const data = await response.json();
          if (data?.error) message = data.error;
        } catch {}
        throw new Error(message);
      }

      if (!response.body) throw new Error("Flux de réponse indisponible.");

      setLoading(true, "27sys prépare sa réponse…");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      function ensureBotMessage() {
        if (botMessage) return;
        setLoading(false);
        botMessage = addMessage("", false);
        botMessage.innerHTML = `<span class="ai27-stream-text"></span><span class="ai27-stream-caret" aria-hidden="true"></span>`;
      }

      function appendText(text) {
        if (!text) return;
        if (!gotFirstToken) {
          gotFirstToken = true;
          ensureBotMessage();
        }
        botText += text;
        const span = botMessage.querySelector(".ai27-stream-text");
        if (span) span.textContent = botText;
        scroll();
      }

      function processSseBlock(block) {
        const lines = block.split(/\r?\n/);
        const dataLines = lines.filter(line => line.startsWith("data:")).map(line => line.slice(5).trim());
        if (!dataLines.length) return;
        const raw = dataLines.join("\n");
        if (!raw || raw === "[DONE]") return;
        try {
          const packet = JSON.parse(raw);
          const parts = packet?.candidates?.[0]?.content?.parts || [];
          for (const part of parts) {
            if (part?.thought) continue;
            if (typeof part?.text === "string") appendText(part.text);
          }
        } catch {
          // Ignore incomplete SSE JSON fragments; the stream parser keeps buffering them.
        }
      }

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        streamBuffer += decoder.decode(value, { stream: true });

        const blocks = streamBuffer.split(/\r?\n\r?\n/);
        streamBuffer = blocks.pop() || "";
        for (const block of blocks) processSseBlock(block);
      }

      streamBuffer += decoder.decode();
      if (streamBuffer.trim()) processSseBlock(streamBuffer);

      if (!gotFirstToken || !botText.trim()) {
        throw new Error("Gemini n’a renvoyé aucun texte.");
      }

      if (botMessage) {
        const caret = botMessage.querySelector(".ai27-stream-caret");
        if (caret) caret.remove();
      }

      history.push({ role: "assistant", content: botText.trim() });
      history = history.slice(-6);
      saveHistory();
      setWhatsApp();
    } catch (error) {
      console.error("27sys Gemini assistant", error);
      setLoading(false);
      if (botMessage) botMessage.remove();
      const fallback = addMessage("Je n’arrive pas à joindre l’assistance virtuelle pour le moment. Tu peux continuer directement avec 27sys sur WhatsApp.", false, true);
      fallback.scrollIntoView({ block: "nearest" });
    } finally {
      setLoading(false);
      send.disabled = false;
      input.focus();
      scroll();
    }
  }

  launcher.addEventListener("click", event => {
    if (event.target.closest(".ai27-dismiss")) {
      event.stopPropagation();
      launcher.classList.remove("ai27-visible");
      try { sessionStorage.setItem("ai27-invite-dismissed", "1"); } catch {}
      return;
    }
    openAssistant();
  });

  app.querySelector(".ai27-close").addEventListener("click", closeAssistant);
  document.getElementById("ai27-reset").addEventListener("click", resetConversation);
  send.addEventListener("click", sendMessage);
  input.addEventListener("keydown", event => {
    if (event.key === "Enter") sendMessage();
  });

  setWhatsApp();
  if (!sessionStorage.getItem("ai27-invite-dismissed")) {
    window.setTimeout(() => launcher.classList.add("ai27-visible"), 1200);
  }
})();
