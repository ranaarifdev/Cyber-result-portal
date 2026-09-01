"use strict";

(() => {
  const form = document.querySelector("#search-form");
  if (!form) return;
  const input = document.querySelector("#roll-number");
  const status = document.querySelector("#search-status");
  const button = form.querySelector("button[type='submit']");
  const normalize = (value) => value.replace(/\s+/g, "").toUpperCase();

  document.querySelector("#use-example").addEventListener("click", () => {
    input.value = "ECTE231122145";
    input.focus();
  });

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      status.textContent = "";
      status.className = "form-status";
      button.disabled = false;
      input.focus();
    }, 0);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const roll = normalize(input.value);
    status.className = "form-status";
    if (!roll) {
      status.textContent = "Please enter your roll number.";
      status.classList.add("error"); input.focus(); return;
    }
    if (!/^[A-Z0-9-]{6,24}$/.test(roll)) {
      status.textContent = "Invalid roll number format.";
      status.classList.add("error"); input.focus(); return;
    }
    button.disabled = true;
    status.textContent = "Searching local result records…";
    const target = new URL("pages/result.html", window.location.href);
    target.searchParams.set("roll", roll);
    window.location.assign(target.href);
  });
})();
