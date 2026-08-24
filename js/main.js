/**
 * ============================================================================
 * 27SYS SERVICES — COMPORTEMENTS DU SITE
 * ----------------------------------------------------------------------------
 * Ce fichier n'a pas besoin d'être modifié pour changer le contenu du site.
 * Pour changer un texte : modifiez index.html.
 * Pour changer un numéro, un lien, un tarif : modifiez js/config.js.
 * ============================================================================
 */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function readConfigPath(path) {
    return path.split(".").reduce(function (obj, key) {
      return obj && obj[key] !== undefined ? obj[key] : "";
    }, CONFIG);
  }

  var computed = {
    waLink:
      "https://wa.me/" +
      CONFIG.contact.whatsappNumber +
      "?text=" +
      encodeURIComponent(CONFIG.contact.whatsappMessage),
    telLink: "tel:" + CONFIG.contact.phoneHref,
  };

  function resolveValue(path) {
    if (computed[path] !== undefined) return computed[path];
    return readConfigPath(path);
  }

  document.querySelectorAll("[data-cfg]").forEach(function (el) {
    var value = resolveValue(el.getAttribute("data-cfg"));
    if (value) el.textContent = value;
  });

  document.querySelectorAll("[data-cfg-href]").forEach(function (el) {
    var value = resolveValue(el.getAttribute("data-cfg-href"));
    if (value) {
      el.setAttribute("href", value);
    } else {
      el.setAttribute("aria-hidden", "true");
      el.setAttribute("tabindex", "-1");
      el.style.display = "none";
    }
  });

  document.querySelectorAll(".bento-wa-link[data-wa-topic]").forEach(function (el) {
    var topic = el.getAttribute("data-wa-topic");
    var message = "Bonjour 27sys, j'aimerais avoir des informations concernant " + topic + ".";
    el.setAttribute(
      "href",
      "https://wa.me/" + CONFIG.contact.whatsappNumber + "?text=" + encodeURIComponent(message)
    );
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });

  var pricingAnswer = document.getElementById("faq-pricing-answer");
  if (pricingAnswer && CONFIG.pricing.diagnostic) {
    pricingAnswer.textContent =
      "Le diagnostic est facturé " +
      CONFIG.pricing.diagnostic +
      ". " +
      CONFIG.pricing.homeVisitNote;
  }

  function mountPhoto(imgId, placeholderId, path) {
    var img = document.getElementById(imgId);
    var placeholder = document.getElementById(placeholderId);
    if (!img || !path) return;
    img.addEventListener("load", function () {
      img.style.display = "block";
      if (placeholder) placeholder.style.display = "none";
    });
    img.addEventListener("error", function () {
      img.style.display = "none";
      if (placeholder) placeholder.style.display = "flex";
    });
    img.src = path;
  }
  mountPhoto("about-photo", "about-photo-placeholder", CONFIG.images.aboutPhoto);

  if (CONFIG.images.ogImage) {
    var ogTag = document.createElement("meta");
    ogTag.setAttribute("property", "og:image");
    ogTag.setAttribute(
      "content",
      CONFIG.seo.siteUrl.replace(/\/$/, "") + "/" + CONFIG.images.ogImage
    );
    document.head.appendChild(ogTag);
  }

  var schema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": CONFIG.business.name,
    "image": CONFIG.images.ogImage
      ? CONFIG.seo.siteUrl.replace(/\/$/, "") + "/" + CONFIG.images.ogImage
      : undefined,
    "telephone": CONFIG.contact.phoneHref,
    "email": CONFIG.contact.email,
    "areaServed": "Casablanca",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": CONFIG.business.city,
      "addressCountry": "MA",
    },
    "url": CONFIG.seo.siteUrl,
    "description":
      "Dépannage informatique, installation de postes et réseaux pour professionnels, PC Gaming, hardware et Wi-Fi à Casablanca.",
  };
  var schemaScript = document.createElement("script");
  schemaScript.type = "application/ld+json";
  schemaScript.textContent = JSON.stringify(schema);
  document.head.appendChild(schemaScript);

  var header = document.getElementById("site-header");
  function onScrollHeader() {
    if (window.scrollY > 12) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  var navToggle = document.getElementById("nav-toggle");
  var mainNav = document.getElementById("main-nav");
  navToggle.addEventListener("click", function () {
    var isOpen = mainNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    navToggle.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
  });
  mainNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      mainNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  document.querySelectorAll(".faq-trigger").forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var item = trigger.closest(".faq-item");
      var isOpen = item.classList.contains("is-open");

      document.querySelectorAll(".faq-item.is-open").forEach(function (open) {
        open.classList.remove("is-open");
        open.querySelector(".faq-trigger").setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });

  var revealTargets = document.querySelectorAll(
    ".bento-card, .ask-card, .skill-group, .method-step, .trust-item, .faq-item, .about-inner, .contact-inner"
  );
  revealTargets.forEach(function (el) { el.classList.add("reveal"); });

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach(function (el) { observer.observe(el); });
  }

  /* --------------------------------------------------------------------
   * HERO — 27sys editorial workshop composition
   * The existing photo in /images is used as the real visual anchor.
   * No domain, hosting or deployment settings are changed here.
   * ------------------------------------------------------------------ */
  var heroDossier = document.querySelector(".hero-dossier");
  if (heroDossier) {
    heroDossier.innerHTML =
      '<img class="hero-workshop-photo" src="images/hero-technicien.webp.png" alt="Technicien travaillant sur un PC ouvert dans un atelier informatique" loading="eager">' +
      '<div class="hero-photo-overlay"></div>' +
      '<div class="hero-photo-meta"><span>27SYS / WORKSHOP 01</span><span>CASABLANCA / MA</span></div>' +
      '<div class="hero-photo-badge"><span class="status-dot"></span>INTERVENTION TECHNIQUE</div>' +
      '<div class="hero-photo-caption"><strong>HARDWARE / DIAGNOSTIC</strong><small>PC · COMPONENTS · TROUBLESHOOTING</small></div>';

    var heroStyle = document.createElement("style");
    heroStyle.textContent = `
      .hero{min-height:850px;padding:142px 0 76px;background:var(--paper)}
      .hero-inner{grid-template-columns:minmax(0,.9fr) minmax(520px,1.1fr);gap:64px;align-items:center}
      .hero-copy{position:relative;z-index:4}
      .hero-title{font-size:clamp(4rem,6.5vw,6.9rem);max-width:760px;line-height:.9;letter-spacing:-.07em;margin-bottom:30px}
      .hero-sub{max-width:610px;font-size:17px;line-height:1.7}
      .hero-ctas{margin-bottom:36px}
      .hero-facts{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--line);padding-top:20px;max-width:690px}
      .hero-facts span{padding:0 18px 0 0;margin:0 18px 0 0;border-right:1px solid var(--line);font-family:var(--body);font-size:11px;letter-spacing:0;text-transform:none;color:var(--ink);line-height:1.35}
      .hero-facts span:last-child{border:0;margin-right:0}
      .hero-facts b{display:block;margin:0 0 7px;color:var(--blue);font-family:var(--mono);font-size:10px;font-weight:500}
      .hero-visual{position:relative;z-index:2}
      .hero-dossier{position:relative;min-height:610px;padding:0!important;border:0!important;border-radius:2px;background:var(--navy);color:#fff;overflow:hidden;box-shadow:24px 26px 0 rgba(21,24,28,.08)}
      .hero-dossier:before{display:none!important}
      .hero-workshop-photo{position:absolute;inset:0;width:100%;height:100%;display:block;object-fit:cover;object-position:center center}
      .hero-photo-overlay{position:absolute;inset:0;background:linear-gradient(90deg,rgba(11,18,25,.04) 0%,rgba(11,18,25,.02) 48%,rgba(11,18,25,.12) 100%),linear-gradient(180deg,rgba(11,18,25,.02) 38%,rgba(11,18,25,.82) 100%)}
      .hero-photo-overlay:after{content:'';position:absolute;inset:16px;border:1px solid rgba(255,255,255,.25);pointer-events:none}
      .hero-photo-meta{position:absolute;z-index:3;top:21px;left:22px;right:22px;display:flex;justify-content:space-between;gap:15px;color:rgba(255,255,255,.86);font-family:var(--mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;text-shadow:0 1px 8px rgba(0,0,0,.35)}
      .hero-photo-badge{position:absolute;z-index:3;left:22px;bottom:102px;padding:8px 11px;background:rgba(21,24,28,.72);backdrop-filter:blur(8px);color:#fff;font-family:var(--mono);font-size:8px;letter-spacing:.1em}
      .hero-photo-badge .status-dot{display:inline-block;width:6px;height:6px;margin-right:7px;border-radius:50%;background:var(--orange)}
      .hero-photo-caption{position:absolute;z-index:3;left:22px;right:22px;bottom:22px;padding-top:16px;border-top:1px solid rgba(255,255,255,.3);color:#fff}
      .hero-photo-caption strong{display:block;font-family:var(--display);font-size:18px;letter-spacing:.01em;font-weight:600}
      .hero-photo-caption small{display:block;margin-top:5px;color:rgba(255,255,255,.7);font-family:var(--mono);font-size:8px;letter-spacing:.1em}
      @media(max-width:1050px){.hero{min-height:790px}.hero-inner{grid-template-columns:minmax(0,.9fr) minmax(390px,1.1fr);gap:40px}.hero-title{font-size:clamp(3.6rem,6.7vw,5.8rem)}.hero-dossier{min-height:540px}.hero-facts{grid-template-columns:repeat(2,1fr);row-gap:16px}.hero-facts span:nth-child(2){border:0}}
      @media(max-width:760px){.hero{min-height:auto;padding:118px 0 70px}.hero-inner{grid-template-columns:1fr;gap:42px}.hero-title{font-size:clamp(3.4rem,15vw,5.3rem)}.hero-sub{font-size:16px}.hero-dossier{min-height:430px;box-shadow:12px 14px 0 rgba(21,24,28,.08)}.hero-facts{grid-template-columns:repeat(2,1fr);gap:14px 0}.hero-facts span{border:0!important;margin:0;padding-right:12px}.hero-photo-meta{top:16px;left:17px;right:17px;font-size:8px}.hero-photo-badge{left:17px;bottom:92px}.hero-photo-caption{left:17px;right:17px;bottom:17px}.hero-photo-overlay:after{inset:12px}}
    `;
    document.head.appendChild(heroStyle);
  }

  /* --------------------------------------------------------------------
   * HERO CTA — Free virtual assistance
   * This CTA is inserted directly into the first-screen CTA row and
   * opens the existing AI assistant launcher when clicked.
   * ------------------------------------------------------------------ */
  (function mountVirtualAssistanceCTA() {
    function mount() {
      var ctas = document.querySelector(".hero-ctas");
      if (!ctas || document.getElementById("hero-ai27-button")) return;

      var button = document.createElement("button");
      button.type = "button";
      button.id = "hero-ai27-button";
      button.className = "btn btn-ai-assistance";
      button.textContent = "Assistance Virtuelle Gratuite ↗";
      button.setAttribute("aria-label", "Ouvrir l'assistance virtuelle gratuite 27sys");
      button.addEventListener("click", function () {
        var assistantLauncher = document.getElementById("ai27-launcher");
        if (assistantLauncher) {
          assistantLauncher.click();
          return;
        }
        var attempts = 0;
        var retry = setInterval(function () {
          attempts += 1;
          var launcher = document.getElementById("ai27-launcher");
          if (launcher) {
            clearInterval(retry);
            launcher.click();
          } else if (attempts >= 20) {
            clearInterval(retry);
          }
        }, 100);
      });
      ctas.appendChild(button);

      var style = document.createElement("style");
      style.textContent = `
        .hero-ctas .btn-ai-assistance{border:1px solid rgba(255,255,255,.78);color:#fff;background:rgba(10,15,20,.24);box-shadow:0 8px 24px rgba(0,0,0,.16);backdrop-filter:blur(5px)}
        .hero-ctas .btn-ai-assistance:hover{background:#1677ff;border-color:#1677ff;color:#fff;transform:translateY(-1px)}
        .hero-ctas .btn-ai-assistance:focus-visible{outline:2px solid #8fd0ff;outline-offset:3px}
        @media(max-width:760px){.hero-ctas .btn-ai-assistance{width:100%}}
      `;
      document.head.appendChild(style);
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
    else mount();
  })();
})();
