"use strict";

const PORTAL_CONFIG = {
  publicMode: false,
  showPrivacyWarning: true,
  allowDownloads: true
};

window.PORTAL_CONFIG = Object.freeze(PORTAL_CONFIG);

const siteLoader = document.querySelector("#site-loader");
if (siteLoader) {
  const dismissLoader = () => {
    siteLoader.classList.add("is-hidden");
    window.setTimeout(() => siteLoader.remove(), 450);
  };
  if (document.readyState === "complete") dismissLoader();
  else window.addEventListener("load", dismissLoader, { once: true });
  window.setTimeout(dismissLoader, 4000);
}

const navToggle = document.querySelector("#nav-toggle");
const boardNav = document.querySelector("#board-nav");

if (navToggle && boardNav) {
  const closeNavigation = () => {
    boardNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  navToggle.addEventListener("click", () => {
    const willOpen = !boardNav.classList.contains("is-open");
    boardNav.classList.toggle("is-open", willOpen);
    navToggle.setAttribute("aria-expanded", String(willOpen));
  });
  boardNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNavigation));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNavigation();
  });
}

if (document.body.dataset.page === "home") {
  const navigationLinks = [...document.querySelectorAll("#board-nav a[href^='#']")];
  const sections = navigationLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && navigationLinks.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navigationLinks.forEach((link) => {
        if (link.getAttribute("href") === `#${visible.target.id}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-30% 0px -55%", threshold: [0, 0.15, 0.5] });
    sections.forEach((section) => sectionObserver.observe(section));
  }
}

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
  document.body.classList.add("motion-ready");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8%", threshold: 0.08 });
  document.querySelectorAll(".portal-dashboard,.board-section,.info-grid,.privacy-summary,.class-analytics,.page-card,.result-shell").forEach((element) => revealObserver.observe(element));
}

document.querySelectorAll("[data-private-notice]").forEach((notice) => {
  notice.hidden = PORTAL_CONFIG.publicMode || !PORTAL_CONFIG.showPrivacyWarning;
});

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    const serviceWorkerPath = document.body.dataset.page === "home" ? "service-worker.js" : "../service-worker.js";
    navigator.serviceWorker.register(serviceWorkerPath).catch((error) => console.error("Offline cache registration failed", error));
  });
}
