/*
 * 27sys legacy chatbot disabled.
 * The public website now uses /assistance.html for the interactive
 * N1 troubleshooting decision tree.
 *
 * Keep this file as a harmless compatibility stub because older cached
 * index.html versions may still reference js/chatbot.js.
 */
(() => {
  'use strict';

  // Remove any legacy widget that may have been injected by an old cached copy.
  const legacyIds = [
    'ai27-launcher', 'ai27', 'ai27-style',
    'sys-assistant-launcher', 'sys-assistant', 'sys-assistant-style'
  ];

  const removeLegacy = () => {
    legacyIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
  };

  removeLegacy();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeLegacy, { once: true });
  }
})();
