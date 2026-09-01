"use strict";

window.PortalUtils = Object.freeze({
  normalizeRoll(value) { return String(value || "").replace(/\s+/g, "").toUpperCase(); },
  validRoll(value) { return /^[A-Z0-9-]{6,24}$/.test(value); },
  display(value, fallback = "Not provided") { return value === null || value === undefined || value === "" ? fallback : String(value); },
  decimal(value, fallback = "—") { return value === null || value === undefined ? fallback : Number(value).toFixed(2); },
  el(tag, options = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(options).forEach(([key, value]) => {
      if (key === "className") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key.startsWith("aria-")) node.setAttribute(key, value);
      else node[key] = value;
    });
    (Array.isArray(children) ? children : [children]).filter(Boolean).forEach((child) => node.append(child));
    return node;
  },
  definition(label, value) {
    const wrap = this.el("div");
    wrap.append(this.el("dt", { text: label }), this.el("dd", { text: this.display(value) }));
    return wrap;
  }
});
