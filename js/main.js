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
   * 13. HERO — photographie atelier 27sys
   *    On remplace le dossier graphique générique par la vraie photo
   *    présente dans /images, sans toucher à la configuration du domaine.
   * ------------------------------------------------------------------ */
  var heroDossier = document.querySelector(".hero-dossier");
  if (heroDossier) {
    heroDossier.innerHTML =
      '<img class="hero-workshop-photo" src="images/hero-technicien.webp.png" alt="PC ouvert en cours de maintenance dans l\'atelier 27sys" loading="eager">' +
      '<div class="hero-photo-overlay"></div>' +
      '<div class="hero-photo-meta"><span>27SYS / WORKSHOP 01</span><span>CASABLANCA / MA</span></div>' +
      '<div class="hero-photo-caption"><span class="status-dot"></span><strong>HARDWARE / DIAGNOSTIC</strong><small>PC · COMPONENTS · TROUBLESHOOTING</small></div>';

    var heroStyle = document.createElement("style");
    heroStyle.textContent = `
      .hero-dossier{min-height:560px;padding:0!important;border:1px solid var(--ink);background:var(--navy);overflow:hidden;box-shadow:24px 28px 0 rgba(21,24,28,.08)}
      .hero-dossier:before{display:none!important}
      .hero-workshop-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center center}
      .hero-photo-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,16,22,.05) 15%,rgba(10,16,22,.08) 42%,rgba(10,16,22,.82) 100%)}
      .hero-photo-overlay:after{content:'';position:absolute;inset:18px;border:1px solid rgba(255,255,255,.24);pointer-events:none}
      .hero-photo-meta{position:absolute;z-index:3;top:22px;left:22px;right:22px;display:flex;justify-content:space-between;gap:15px;color:rgba(255,255,255,.82);font-family:var(--mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase}
      .hero-photo-caption{position:absolute;z-index:3;left:22px;right:22px;bottom:22px;padding:17px 18px;border-top:1px solid rgba(255,255,255,.3);color:#fff;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
      .hero-photo-caption strong{font-family:var(--display);font-size:14px;letter-spacing:.02em}
      .hero-photo-caption small{width:100%;margin-left:16px;color:rgba(255,255,255,.66);font-family:var(--mono);font-size:8px;letter-spacing:.1em}
      .hero-photo-caption .status-dot{flex:0 0 6px}
      @media (max-width:900px){.hero-dossier{min-height:460px}.hero-photo-meta{font-size:8px}.hero-photo-caption{bottom:18px;left:18px;right:18px}}
      @media (max-width:640px){.hero-dossier{min-height:390px;box-shadow:12px 14px 0 rgba(21,24,28,.08)}.hero-photo-overlay:after{inset:12px}.hero-photo-meta{top:15px;left:15px;right:15px}.hero-photo-caption{left:15px;right:15px;bottom:15px;padding:12px}.hero-photo-caption small{font-size:7px}}
    `;
    document.head.appendChild(heroStyle);
  }
})();
