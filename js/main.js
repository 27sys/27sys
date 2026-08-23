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

  /* --------------------------------------------------------------------
   * 1. Lecture d'une valeur imbriquée dans CONFIG à partir d'un chemin
   *    du type "location.hours"
   * ------------------------------------------------------------------ */
  function readConfigPath(path) {
    return path.split(".").reduce(function (obj, key) {
      return obj && obj[key] !== undefined ? obj[key] : "";
    }, CONFIG);
  }

  /* --------------------------------------------------------------------
   * 2. Valeurs calculées (liens WhatsApp / téléphone / tarif)
   * ------------------------------------------------------------------ */
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

  /* --------------------------------------------------------------------
   * 3. Injection des textes (data-cfg="chemin.dans.config")
   * ------------------------------------------------------------------ */
  document.querySelectorAll("[data-cfg]").forEach(function (el) {
    var value = resolveValue(el.getAttribute("data-cfg"));
    if (value) el.textContent = value;
  });

  /* --------------------------------------------------------------------
   * 4. Injection des liens (data-cfg-href="chemin.dans.config")
   *    Les boutons/liens dont la valeur config est vide sont masqués
   *    proprement (ex: LinkedIn ou Google Business non renseignés).
   * ------------------------------------------------------------------ */
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

  /* --------------------------------------------------------------------
   * 5bis. Liens WhatsApp par service ("Parler de ce besoin →")
   *    Chaque carte de service porte un attribut data-wa-topic. On lui
   *    construit un lien WhatsApp avec un message pré-rempli spécifique,
   *    plus efficace qu'un simple "Contactez-nous" générique.
   * ------------------------------------------------------------------ */
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

  /* --------------------------------------------------------------------
   * 5. Tarif du diagnostic dans la FAQ (ne jamais inventer de prix)
   * ------------------------------------------------------------------ */
  var pricingAnswer = document.getElementById("faq-pricing-answer");
  if (pricingAnswer && CONFIG.pricing.diagnostic) {
    pricingAnswer.textContent =
      "Le diagnostic est facturé " +
      CONFIG.pricing.diagnostic +
      ". " +
      CONFIG.pricing.homeVisitNote;
  }

  /* --------------------------------------------------------------------
   * 6. Photos : si un chemin est renseigné dans config.js, on affiche
   *    la vraie photo et on masque le cadre technique de remplacement.
   * ------------------------------------------------------------------ */
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

  /* --------------------------------------------------------------------
   * 7. Open Graph image (si renseignée)
   * ------------------------------------------------------------------ */
  if (CONFIG.images.ogImage) {
    var ogTag = document.createElement("meta");
    ogTag.setAttribute("property", "og:image");
    ogTag.setAttribute(
      "content",
      CONFIG.seo.siteUrl.replace(/\/$/, "") + "/" + CONFIG.images.ogImage
    );
    document.head.appendChild(ogTag);
  }

  /* --------------------------------------------------------------------
   * 8. Données structurées Schema.org (LocalBusiness) pour Google
   * ------------------------------------------------------------------ */
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

  /* --------------------------------------------------------------------
   * 9. En-tête : fond au scroll
   * ------------------------------------------------------------------ */
  var header = document.getElementById("site-header");
  function onScrollHeader() {
    if (window.scrollY > 12) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* --------------------------------------------------------------------
   * 10. Menu mobile
   * ------------------------------------------------------------------ */
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

  /* --------------------------------------------------------------------
   * 11. Accordéon FAQ
   * ------------------------------------------------------------------ */
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

  /* --------------------------------------------------------------------
   * 12. Apparition au défilement (scroll reveal)
   * ------------------------------------------------------------------ */
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
})();
