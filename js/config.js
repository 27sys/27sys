/**
 * ============================================================================
 * 27SYS SERVICES — CONFIGURATION CENTRALE
 * ============================================================================
 *
 * Ce fichier est le SEUL endroit où vous devez modifier les informations
 * de votre entreprise (téléphone, WhatsApp, adresse, tarifs, liens...).
 *
 * Vous n'avez PAS besoin de toucher aux fichiers index.html, style.css
 * ou main.js. Modifiez uniquement les valeurs entre guillemets ci-dessous,
 * puis enregistrez le fichier.
 *
 * Règle importante : ne supprimez jamais les guillemets " " ni les virgules
 * à la fin de chaque ligne (sauf la dernière d'un groupe).
 * ============================================================================
 */

const CONFIG = {

  // --------------------------------------------------------------------
  // 1. IDENTITÉ DE L'ENTREPRISE
  // --------------------------------------------------------------------
  business: {
    name: "27sys Services",
    shortName: "27sys",
    tagline: "Dépannage informatique • PC Gaming • Hardware • Réseau",
    city: "Casablanca",
    country: "Maroc",
    // Phrase courte utilisée dans le pied de page / signature technique
    footerSignature: "27SYS // BUILDING SYSTEMS, ONE PC AT A TIME.",
  },

  // --------------------------------------------------------------------
  // 2. CONTACT — la partie que vous modifierez le plus souvent
  // --------------------------------------------------------------------
  contact: {
    // Numéro WhatsApp au format INTERNATIONAL, SANS le "+", SANS espaces.
    // Exemple pour un numéro marocain 06 XX XX XX XX : "2126XXXXXXXX"
    whatsappNumber: "212640008930",

    // Message pré-rempli qui s'affichera quand quelqu'un clique sur WhatsApp.
    whatsappMessage: "Bonjour 27sys, j'ai un problème avec mon PC : ",

    // Numéro affiché à l'écran (format lisible pour un humain)
    phoneDisplay: "+212 6 40 00 89 30",

    // Même numéro mais au format technique pour le lien "Appeler"
    // (pas d'espaces, garder le +)
    phoneHref: "+212640008930",

    email: "nbenramou@gmail.com",
  },

  // --------------------------------------------------------------------
  // 3. RÉSEAUX SOCIAUX / FICHES EN LIGNE
  // --------------------------------------------------------------------
  social: {
    // Laissez entre guillemets vides "" pour masquer un bouton non prêt
    linkedin: "https://www.linkedin.com/in/nizar-benramou-0a9847b6/",
    googleBusiness: "",
  },

  // --------------------------------------------------------------------
  // 4. ZONE D'INTERVENTION & HORAIRES
  // --------------------------------------------------------------------
  location: {
    areaLabel: "Casablanca • Intervention à domicile / sur rendez-vous",
    addressLine: "Casablanca et périphérie",
    // Format libre, affiché tel quel sur le site
    hours: "Lun. – Sam. · 9h00 – 19h00 · sur rendez-vous",
  },

  // --------------------------------------------------------------------
  // 5. TARIFS
  // --------------------------------------------------------------------
  // Laissez une valeur vide "" tant que vous n'avez pas fixé de prix :
  // le site affichera alors "Prix communiqué avant intervention"
  // au lieu d'inventer un chiffre.
  pricing: {
    diagnostic: "",       // ex: "150 DH"
    homeVisitNote: "Déplacement à domicile facturé séparément, annoncé avant intervention.",
  },

  // --------------------------------------------------------------------
  // 6. PHOTOS
  // --------------------------------------------------------------------
  // La photo Hero est intégrée directement ici pour le premier lancement.
  // Cela évite de dépendre d'un hébergeur externe.
  images: {
    heroPhoto: "data:image/webp;base64,UklGRiQA6ABXRUJQVlA4IBgA...",
    aboutPhoto: "",
    ogImage: "",
  },

  // --------------------------------------------------------------------
  // 7. RÉFÉRENCEMENT LOCAL (SEO) — utilisé pour Google
  // --------------------------------------------------------------------
  seo: {
    siteUrl: "https://www.27sys.ma",
  },

};
